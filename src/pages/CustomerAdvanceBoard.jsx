import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import { customerAdvanceService } from '../services/customerAdvance.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

const CustomerAdvanceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ banks: [], accounts: [] });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        receiptNo: '',
        receiptDate: new Date().toISOString().split('T')[0],
        payType: 'Cash',
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        bankId: '',
        bankName: '',
        branch: '',
        amount: '0.00',
        debitAccount: '810-101', // Example from screenshot
        debitAccountName: 'Undepodited Funds',
        creditAccount: '',
        creditAccountName: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'bank', 'debit', 'credit'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
            fetchLookups();
            generateDocNo(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await customerAdvanceService.getLookups();
            setLookups({
                banks: data.banks || [],
                accounts: data.settlementAccounts || data.incomeAccounts || []
            });
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await customerAdvanceService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, receiptNo: data.docNo }));
        } catch (error) {
            console.error('Failed to generate doc no');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            payType: 'Cash',
            chequeNo: '',
            chequeDate: new Date().toISOString().split('T')[0],
            bankId: '',
            bankName: '',
            branch: '',
            amount: '0.00',
            debitAccount: '810-101',
            debitAccountName: 'Undepodited Funds',
            creditAccount: '',
            creditAccountName: '',
            memo: ''
        });
        setSearchTerm('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.debitAccount || !formData.creditAccount) return toast.error('Debit and Credit accounts are required.');
        if (parseFloat(formData.amount) <= 0) return toast.error('Valid Amount is required.');

        setLoading(true);
        try {
            await customerAdvanceService.save(formData);
            toast.success('Customer Advance received successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredData = () => {
        if (activeModal === 'bank') return lookups.banks.filter(b => (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'debit' || activeModal === 'credit') return lookups.accounts.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Advance Receive"
                maxWidth="max-w-[750px]"
                footer={
                    <div className="bg-slate-50 px-5 py-3.5 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-8 bg-[#0078d4] text-white text-[12px] font-bold rounded-sm shadow-sm hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-8 bg-white border border-gray-300 text-slate-600 text-[12px] font-bold rounded-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                             <RotateCcw size={13} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-8 bg-white border border-gray-300 text-slate-600 text-[12px] font-bold rounded-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                             <X size={13} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Plus_Jakarta_Sans']">
                    <div className="bg-white p-5 border border-gray-100 rounded shadow-sm">
                        <div className="grid grid-cols-12 gap-x-8 gap-y-3.5">
                            
                            {/* Left Column - Core Fields */}
                            <div className="col-span-12 lg:col-span-7 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Receipt No</label>
                                    <input type="text" value={formData.receiptNo} readOnly className="flex-1 h-8 border border-gray-200 px-3 text-[12px] font-bold text-[#0078d4] bg-white rounded-sm outline-none tracking-widest shadow-sm" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Pay Type</label>
                                    <select name="payType" value={formData.payType} onChange={handleInputChange} className="flex-1 h-8 border border-gray-200 px-2 text-[11px] outline-none rounded-sm bg-white font-bold shadow-sm">
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Direct Deposit">Direct Deposit</option>
                                        <option value="Credit Card">Credit Card</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Cheque No</label>
                                    <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} disabled={formData.payType !== 'Cheque'} type="text" placeholder="No..." className="flex-1 h-8 border border-gray-200 px-3 text-[11px] outline-none rounded-sm disabled:bg-gray-50 bg-white shadow-sm" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Bank</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.bankName} 
                                            placeholder="Select Bank..." 
                                            className="flex-1 h-8 border border-gray-200 px-2 text-[11px] rounded-sm bg-white outline-none shadow-sm" 
                                            disabled={formData.payType === 'Cash'}
                                        />
                                        <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} disabled={formData.payType === 'Cash'} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90 disabled:opacity-50">
                                            <Search size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Amount</label>
                                    <input 
                                        name="amount" 
                                        value={formData.amount} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.01" 
                                        className="w-40 h-8 border-b-2 border-slate-200 px-2 text-[16px] text-right font-black text-[#b91c1c] outline-none focus:border-[#0078d4] bg-transparent tabular-nums" 
                                        placeholder="0.00" 
                                    />
                                </div>

                                <div className="pt-3 space-y-3 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Debit</label>
                                        <div className="flex-1 flex gap-1">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={formData.debitAccountName ? `${formData.debitAccount} - ${formData.debitAccountName}` : ''} 
                                                placeholder="Select Debit Account..." 
                                                className="flex-1 h-8 border border-gray-200 px-3 text-[12px] font-bold text-slate-700 rounded-sm bg-white outline-none shadow-sm" 
                                            />
                                            <button onClick={() => { setActiveModal('debit'); setSearchTerm(''); }} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Credit</label>
                                        <div className="flex-1 flex gap-1">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={formData.creditAccountName ? `${formData.creditAccount} - ${formData.creditAccountName}` : ''} 
                                                placeholder="Select Credit Account..." 
                                                className="flex-1 h-8 border border-gray-200 px-3 text-[12px] font-bold text-slate-700 rounded-sm bg-white outline-none shadow-sm" 
                                            />
                                            <button onClick={() => { setActiveModal('credit'); setSearchTerm(''); }} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Secondary Metadata */}
                            <div className="col-span-12 lg:col-span-5 space-y-3 bg-gray-50/20 p-4 border border-gray-100 rounded-sm">
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Rec. Date</label>
                                    <input name="receiptDate" type="date" value={formData.receiptDate} onChange={handleInputChange} className="flex-1 h-8 border border-gray-200 px-2 text-[11px] font-bold text-[#0078d4] outline-none rounded-sm bg-white shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Chq. Date</label>
                                    <input name="chequeDate" type="date" value={formData.chequeDate} onChange={handleInputChange} disabled={formData.payType !== 'Cheque'} className="flex-1 h-8 border border-gray-200 px-2 text-[11px] font-bold text-gray-600 outline-none rounded-sm disabled:bg-gray-100 bg-white shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-bold text-slate-400 w-20 shrink-0 uppercase tracking-wider">Branch</label>
                                    <input name="branch" value={formData.branch} onChange={handleInputChange} placeholder="Name..." disabled={formData.payType === 'Cash'} type="text" className="flex-1 w-7 h-8 border border-gray-200 px-2 text-[11px] outline-none rounded-sm disabled:bg-gray-100 bg-white shadow-sm" />
                                </div>

                                <div className="pt-4">
                                    <div className="p-3 bg-white border border-gray-100 rounded-sm shadow-sm space-y-1 text-right">
                                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">TOTAL ADVANCE</div>
                                        <div className="text-[20px] font-black text-[#0078d4] tabular-nums leading-none">
                                            {parseFloat(formData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Memo */}
                            <div className="col-span-12">
                                <div className="flex flex-col gap-1.5 pt-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 font-['Plus_Jakarta_Sans']">Memo / Remarks</label>
                                    <input 
                                        name="memo" 
                                        value={formData.memo} 
                                        onChange={handleInputChange} 
                                        type="text" 
                                        className="w-full h-9 border border-gray-200 px-3 text-[12px] focus:border-[#0078d4] outline-none transition-all shadow-sm rounded-sm placeholder:text-gray-300" 
                                        placeholder="Internal remarks for advance receipt..." 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modal Wrapper */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                {activeModal === 'bank' ? 'Search Banks' : 'Search Accounts'}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by code or name..." 
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                                <button 
                                    onClick={() => setActiveModal(null)} 
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'bank') {
                                                setFormData(prev => ({ ...prev, bankId: item.code || item.Bank_Code, bankName: item.name || item.Bank_Name }));
                                            } else if (activeModal === 'debit') {
                                                setFormData(prev => ({ ...prev, debitAccount: item.code || item.Account_Code, debitAccountName: item.name || item.Account_Name }));
                                            } else {
                                                setFormData(prev => ({ ...prev, creditAccount: item.code || item.Account_Code, creditAccountName: item.name || item.Account_Name }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 border-b font-medium text-gray-700">{item.code || item.Bank_Code || item.Account_Code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{item.name || item.Bank_Name || item.Account_Name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic">No results found for "{searchTerm}"</td></tr>
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

export default CustomerAdvanceBoard;
