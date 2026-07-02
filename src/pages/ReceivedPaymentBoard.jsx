import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Search, Calendar, RefreshCw, X, Save, RotateCcw, Loader2, CreditCard } from 'lucide-react';
import receivePaymentService from '../services/receivePayment.service';
import ReceivedPaymentDetailModal from '../components/ReceivedPaymentDetailModal';


import CalendarModal from '../components/CalendarModal';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';



const ReceivedPaymentBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ banks: [], accounts: [] });
    const [loading, setLoading] = useState(false);

    const getInitialFormData = () => ({
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

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null); // 'bank', 'debit', 'credit', 'payType'
    const [showReceiptDateModal, setShowReceiptDateModal] = useState(false);
    const [showChequeDateModal, setShowChequeDateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [receiptData, setReceiptData] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
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
            showErrorToast('Failed to load lookups.');
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
        if (!formData.debitAccount || !formData.creditAccount) return showErrorToast('Debit and Credit accounts are required.');
        if (parseFloat(formData.amount) <= 0) return showErrorToast('Valid amount is required.');

        setLoading(true);
        try {
            await receivePaymentService.apply(formData);
            showSuccessToast('Payment received successfully!');
            setReceiptData({ ...formData });
            setShowReceipt(true);
            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
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
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Received Payment"
                subtitle="Received Payments"
                icon={CreditCard}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-xl gap-3">
                        <div className="flex gap-3">
                            <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none"></span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={14} /> CLEAR FORM
                            </button>
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE PAYMENT
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700 overflow-y-auto max-h-[80vh] no-scrollbar">
                    {/* 1. Header Information Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-[3px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Receipt No */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Receipt No</label>
                                <div className="relative">
                                    <input type="text" value={formData.receiptNo} readOnly className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={generateReceiptNo} className="w-10 h-8 bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Rec. Date */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Rec. Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.receiptDate} onClick={() => setShowReceiptDateModal(true)} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[3px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowReceiptDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-4 flex items-center justify-end gap-2 pr-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount:</label>
                                <input name="amount" value={formData.amount} onChange={handleInputChange} type="number" step="0.01" className="w-40 min-w-0 h-9 border-2 border-[#0285fd] px-3 text-right text-[15px] font-mono font-black text-[#0285fd] outline-none bg-white rounded-[3px] shadow-sm focus:ring-1 focus:ring-[#0285fd] tabular-nums" placeholder="0.00" />
                            </div>

                            {/* Pay Type */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Type</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.payType} onClick={() => { setActiveModal('payType'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[3px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => { setActiveModal('payType'); setSearchTerm(''); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Debit Account */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Debit A/C</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.accounts.find(a => a.Account_Code === formData.debitAccount)?.Account_Name ? `${formData.debitAccount} - ${lookups.accounts.find(a => a.Account_Code === formData.debitAccount)?.Account_Name}` : ''} placeholder="Select Debit..." onClick={() => { setActiveModal('debit'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[3px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('debit'); setSearchTerm(''); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Credit Account */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Credit A/C</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.accounts.find(a => a.Account_Code === formData.creditAccount)?.Account_Name ? `${formData.creditAccount} - ${lookups.accounts.find(a => a.Account_Code === formData.creditAccount)?.Account_Name}` : ''} placeholder="Select Credit..." onClick={() => { setActiveModal('credit'); setSearchTerm(''); }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[3px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('credit'); setSearchTerm(''); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cheque No</label>
                                <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} disabled={formData.payType !== 'Cheque'} type="text" placeholder="No..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Chq. Date */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Chq. Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.chequeDate} onClick={() => formData.payType === 'Cheque' && setShowChequeDateModal(true)} disabled={formData.payType !== 'Cheque'} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[3px] px-3 text-[12px] outline-none bg-white disabled:bg-gray-100 text-gray-700 font-bold cursor-pointer shadow-sm" />
                                    <button onClick={() => setShowChequeDateModal(true)} disabled={formData.payType !== 'Cheque'} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bank */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Bank</label>
                                <div className="relative">
                                    <input type="text" readOnly value={lookups.banks.find(b => b.Bank_Code === formData.bankId)?.Bank_Name || ''} placeholder="Select Bank..." disabled={formData.payType === 'Cash'} onClick={() => { if(formData.payType !== 'Cash') { setActiveModal('bank'); setSearchTerm(''); } }} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white disabled:bg-gray-100 rounded-[3px] outline-none shadow-sm cursor-pointer" />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} disabled={formData.payType === 'Cash'} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="col-span-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Branch</label>
                                <input name="branch" value={formData.branch} onChange={handleInputChange} disabled={formData.payType === 'Cash'} type="text" placeholder="Branch Name..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Memo / Remarks */}
                            <div className="col-span-8">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Memo / Rem</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Add payment remarks..." />
                            </div>

                        </div>
                    </div>
                </div>

            </TransactionFormWrapper>

            {/* Search Modal */}
            <SimpleModal isOpen={activeModal !== null} onClose={() => setActiveModal(null)} title={activeModal === 'bank' ? 'Search Banks' : activeModal === 'payType' ? 'Select Payment Type' : 'Search Accounts'}>
                <div className="space-y-4 font-['Tahoma']">
                    {activeModal !== 'payType' && (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                            <Search className="text-gray-400" size={15} />
                            <input type="text" className="w-full h-10 border border-gray-300 rounded-[3px] outline-none px-3 text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus placeholder="Search..." />
                        </div>
                    )}
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    {activeModal === 'payType' ? (
                                        <th className=" px-5 py-3">Type</th>
                                    ) : (
                                        <>
                                            <th className=" px-5 py-3">Code</th>
                                            <th className=" px-5 py-3">Name</th>
                                        </>
                                    )}
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeModal === 'payType' ? (
                                    ['Cash', 'Cheque', 'Direct Deposit', 'Credit Card'].map((type, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => { setFormData(prev => ({ ...prev, payType: type })); setActiveModal(null); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{type}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
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
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{activeModal === 'bank' ? item.Bank_Code : item.Account_Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{activeModal === 'bank' ? item.Bank_Name : item.Account_Name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))
                                )}
                                {activeModal !== 'payType' && filteredData().length === 0 && (
                                    <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No results found for "{searchTerm}"</td></tr>
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
            
            {showReceipt && (
                <ReceivedPaymentDetailModal 
                    docNo={receiptData?.receiptNo}
                    preloadedData={receiptData}
                    onClose={() => {
                        setShowReceipt(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default ReceivedPaymentBoard;
