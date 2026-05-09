import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import receivePaymentService from '../services/receivePayment.service';
import { toast } from 'react-hot-toast';
import CalendarModal from '../components/CalendarModal';
import { getSessionData } from '../utils/session';

const ReceivedPaymentBoard = ({ isOpen, onClose }) => {
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
        debitAccount: '',
        creditAccount: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'bank', 'debit', 'credit', 'payType'
    const [showReceiptDateModal, setShowReceiptDateModal] = useState(false);
    const [showChequeDateModal, setShowChequeDateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();
            
            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));

            fetchLookups(companyCode);
            generateReceiptNo(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (companyCode) => {
        try {
            const data = await receivePaymentService.getLookups(companyCode, 'MM');
            setLookups({
                banks: data.banks || [],
                accounts: data.subAccounts || []
            });
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateReceiptNo = async (companyCode) => {
        try {
            const data = await receivePaymentService.generateDoc(companyCode);
            setFormData(prev => ({ ...prev, receiptNo: data.docNo }));
        } catch (error) {
            console.error('Failed to gen receipt no');
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
            debitAccount: '',
            creditAccount: '',
            memo: ''
        });
        setSearchTerm('');
        generateReceiptNo();
    };

    const handleSave = async () => {
        if (!formData.debitAccount || !formData.creditAccount) return toast.error('Debit and Credit accounts are required.');
        if (parseFloat(formData.amount) <= 0) return toast.error('Valid amount is required.');

        setLoading(true);
        try {
            await receivePaymentService.apply(formData);
            toast.success('Payment received successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredData = () => {
        if (activeModal === 'bank') return lookups.banks.filter(b => (b.Bank_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.Bank_Code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'debit' || activeModal === 'credit') return lookups.accounts.filter(a => (a.Account_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.Account_Code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Received Payment"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl gap-3">
                        <div className="flex gap-3">
                            <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none"></span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50">
                                <RefreshCw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#2bb744] text-white text-sm font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE PAYMENT
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700 overflow-y-auto max-h-[80vh] no-scrollbar">
                    {/* 1. Header Information Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Receipt No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Receipt No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.receiptNo} readOnly className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <button onClick={generateReceiptNo} className="w-10 h-8 bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Rec. Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Rec. Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.receiptDate} onClick={() => setShowReceiptDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowReceiptDateModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-4 flex items-center justify-end gap-2 pr-2">
                                <label className="text-[12px] font-bold text-blue-600 uppercase tracking-tight">Amount:</label>
                                <input name="amount" value={formData.amount} onChange={handleInputChange} type="number" step="0.01" className="w-40 min-w-0 h-9 border-2 border-[#0285fd] px-3 text-right text-[15px] font-mono font-black text-[#0285fd] outline-none bg-white rounded-[5px] shadow-sm focus:ring-1 focus:ring-[#0285fd] tabular-nums" placeholder="0.00" />
                            </div>

                            {/* Pay Type */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.payType} onClick={() => { setActiveModal('payType'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => { setActiveModal('payType'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Debit Account */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Debit A/C</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.accounts.find(a => a.Account_Code === formData.debitAccount)?.Account_Name ? `${formData.debitAccount} - ${lookups.accounts.find(a => a.Account_Code === formData.debitAccount)?.Account_Name}` : ''} placeholder="Select Debit..." onClick={() => { setActiveModal('debit'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('debit'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Credit Account */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Credit A/C</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.accounts.find(a => a.Account_Code === formData.creditAccount)?.Account_Name ? `${formData.creditAccount} - ${lookups.accounts.find(a => a.Account_Code === formData.creditAccount)?.Account_Name}` : ''} placeholder="Select Credit..." onClick={() => { setActiveModal('credit'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('credit'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cheque No</label>
                                <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} disabled={formData.payType !== 'Cheque'} type="text" placeholder="No..." className="flex-1 min-w-0 h-8 border border-gray-300 px-3 font-mono text-[12px] outline-none rounded-[5px] disabled:bg-gray-100 bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Chq. Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Chq. Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.chequeDate} onClick={() => formData.payType === 'Cheque' && setShowChequeDateModal(true)} disabled={formData.payType !== 'Cheque'} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white disabled:bg-gray-100 text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowChequeDateModal(true)} disabled={formData.payType !== 'Cheque'} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] disabled:bg-gray-200 disabled:text-gray-400 rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bank */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Bank</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={lookups.banks.find(b => b.Bank_Code === formData.bankId)?.Bank_Name || ''} placeholder="Select Bank..." disabled={formData.payType === 'Cash'} onClick={() => { if(formData.payType !== 'Cash') { setActiveModal('bank'); setSearchTerm(''); } }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white disabled:bg-gray-100 rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} disabled={formData.payType === 'Cash'} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] disabled:bg-gray-200 disabled:text-gray-400 rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Branch</label>
                                <input name="branch" value={formData.branch} onChange={handleInputChange} disabled={formData.payType === 'Cash'} type="text" placeholder="Branch Name..." className="flex-1 min-w-0 h-8 border border-gray-300 px-3 font-mono text-[12px] outline-none rounded-[5px] disabled:bg-gray-100 bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                            </div>

                            {/* Memo / Remarks */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Memo / Rem</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" placeholder="Add payment remarks..." />
                            </div>

                        </div>
                    </div>
                </div>

            </SimpleModal>

            {/* Search Modal */}
            <SimpleModal isOpen={activeModal !== null} onClose={() => setActiveModal(null)} title={activeModal === 'bank' ? 'Search Banks' : activeModal === 'payType' ? 'Select Payment Type' : 'Search Accounts'} maxWidth="max-w-[650px]">
                <div className="space-y-4 font-['Tahoma']">
                    {activeModal !== 'payType' && (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-9 border border-gray-300 rounded-[5px] outline-none px-3 text-sm focus:border-[#0285fd] bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                    )}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    {activeModal === 'payType' ? (
                                        <th className="px-5 py-3">Type</th>
                                    ) : (
                                        <>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Name</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeModal === 'payType' ? (
                                    ['Cash', 'Cheque', 'Direct Deposit', 'Credit Card'].map((type, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData(prev => ({ ...prev, payType: type })); setActiveModal(null); }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{type}</td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredData().map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                            if (activeModal === 'bank') {
                                                setFormData(prev => ({ ...prev, bankId: item.Bank_Code, bankName: item.Bank_Name }));
                                            } else if (activeModal === 'debit') {
                                                setFormData(prev => ({ ...prev, debitAccount: item.Account_Code }));
                                            } else {
                                                setFormData(prev => ({ ...prev, creditAccount: item.Account_Code }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-[#0285fd]">{activeModal === 'bank' ? item.Bank_Code : item.Account_Code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-blue-600">{activeModal === 'bank' ? item.Bank_Name : item.Account_Name}</td>
                                        </tr>
                                    ))
                                )}
                                {activeModal !== 'payType' && filteredData().length === 0 && (
                                    <tr><td colSpan="2" className="p-8 text-center text-gray-400 font-medium italic">No results found for "{searchTerm}"</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Date Modals */}
            {showReceiptDateModal && (
                <CalendarModal isOpen={showReceiptDateModal} onClose={() => setShowReceiptDateModal(false)} currentDate={formData.receiptDate} onDateChange={(d) => { setFormData({ ...formData, receiptDate: d }); setShowReceiptDateModal(false); }} title="Select Receipt Date" />
            )}
            {showChequeDateModal && (
                <CalendarModal isOpen={showChequeDateModal} onClose={() => setShowChequeDateModal(false)} currentDate={formData.chequeDate} onDateChange={(d) => { setFormData({ ...formData, chequeDate: d }); setShowChequeDateModal(false); }} title="Select Cheque Date" />
            )}
        </>
    );
};

export default ReceivedPaymentBoard;
