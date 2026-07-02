import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, X, Save, RotateCcw, Loader2, Banknote } from 'lucide-react';
import { customerAdvanceService } from '../services/customerAdvance.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';


const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

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

const CustomerAdvanceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], drAccounts: [], banks: [], payTypes: [] });
    const [loading, setLoading] = useState(false);

    const getInitialFormData = () => ({
        receiptNo: '',
        postDate: new Date().toISOString().split('T')[0],
        payType: '',
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        bank: '',
        branch: '',
        amount: '0.00',
        debitAccCode: '',
        debitAccName: '',
        creditAccCode: '',
        creditAccName: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showChqDatePicker, setShowChqDatePicker] = useState(false);
    const [receiptTx, setReceiptTx] = useState(null);

    const inputRefs = {
        postDate: useRef(null),
        creditAccCode: useRef(null),
        debitAccCode: useRef(null),
        payType: useRef(null),
        chequeNo: useRef(null),
        chequeDate: useRef(null),
        bank: useRef(null),
        branch: useRef(null),
        amount: useRef(null),
        memo: useRef(null),
        saveBtn: useRef(null)
    };

    const handleKeyDown = (e, currentField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentField === 'creditAccCode') { inputRefs.debitAccCode.current?.focus(); }
            else if (currentField === 'debitAccCode') { inputRefs.payType.current?.focus(); }
            else if (currentField === 'payType') { setActiveModal('payType'); }
            else if (currentField === 'chequeNo') { setShowChqDatePicker(true); }
            else if (currentField === 'chequeDate') { inputRefs.bank.current?.focus(); }
            else if (currentField === 'bank') { inputRefs.branch.current?.focus(); }
            else if (currentField === 'branch') { inputRefs.amount.current?.focus(); }
            else if (currentField === 'amount') { inputRefs.memo.current?.focus(); }
            else if (currentField === 'memo') { handleSave(); }
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({ ...prev, company: companyCode, createUser: userName }));
            fetchLookups(companyCode);
            generateDocNo(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (companyCode) => {
        try {
            const data = await customerAdvanceService.getLookups(companyCode);
            setLookups({
                customers: data.customers || [],
                drAccounts: data.drAccounts || [],
                banks: (data.banks || []).map(b => ({ code: b, name: b })),
                payTypes: data.paymentMethods || []
            });
        } catch (error) { showErrorToast('Failed to load transaction lookups.'); }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await customerAdvanceService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, receiptNo: data.docNo }));
        } catch (error) { console.error('Failed to generate doc number.'); }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handlePayTypeChange = (type) => {
        setFormData(prev => ({
            ...prev, payType: type,
            chequeNo: type === 'CHEQUE' ? prev.chequeNo : '',
            chequeDate: type === 'CHEQUE' ? prev.chequeDate : prev.postDate,
            bank: type === 'CHEQUE' ? prev.bank : '',
            branch: type === 'CHEQUE' ? prev.branch : ''
        }));
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev, payType: '', chequeNo: '', chequeDate: new Date().toISOString().split('T')[0],
            bank: '', branch: '', amount: '0.00',
            debitAccCode: '', debitAccName: '', creditAccCode: '', creditAccName: '', memo: ''
        }));
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.creditAccCode) return showErrorToast('Please select a customer (credit account).');
        if (!formData.debitAccCode) return showErrorToast('Please select a debit account.');
        if (!formData.amount || parseFloat(formData.amount) <= 0) return showErrorToast('Valid Payment Amount is required.');
        if (formData.payType === 'CHEQUE' && !formData.chequeNo) return showErrorToast('Cheque Number is required.');

        setLoading(true);
        try {
            const resp = await customerAdvanceService.save({ ...formData, amount: parseFloat(formData.amount) || 0 });
            showSuccessToast(resp.message || `Customer Advance received successfully! Doc ID: ${resp.docNo}`);
            setReceiptTx({
                type: 'CUSTOMER ADVANCE RECEIPT',
                docNo: resp.docNo || formData.receiptNo,
                date: formData.postDate,
                payee: formData.creditAccName,
                total: parseFloat(formData.amount),
                details: {
                    header: { memo: formData.memo, customerCode: formData.creditAccCode, postDate: formData.postDate, payType: formData.payType, bank: formData.bank, branch: formData.branch, chequeNo: formData.chequeNo, chequeDate: formData.chequeDate },
                    expenses: [{ accCode: formData.debitAccCode, amount: parseFloat(formData.amount), memo: formData.debitAccName }]
                }
            });
            handleClear();
        } catch (error) { showErrorToast(error.toString()); } finally { setLoading(false); }
    };

    const handleSelectCustomer = (item) => { setFormData(prev => ({ ...prev, creditAccCode: item.code, creditAccName: item.name })); };
    const handleSelectDebitAccount = (item) => { setFormData(prev => ({ ...prev, debitAccCode: item.code, debitAccName: item.name })); };
    const handleSelectBank = (item) => { setFormData(prev => ({ ...prev, bank: item.name })); };

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen} onClose={onClose}
                title="Customer Advance Receipt" subtitle="Customer Advances" icon={null}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Doc ID */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.receiptNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>

                            {/* Rec. Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Rec. Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.postDate ? formatDateToDMY(formData.postDate) : ''}
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount *</label>
                                <input type="number" ref={inputRefs.amount} name="amount" step="0.01"
                                    value={formData.amount} onChange={handleInputChange}
                                    onKeyDown={e => handleKeyDown(e, 'amount')}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                            </div>

                            {/* Customer (Credit Account) */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer *</label>
                                <div className="relative">
                                    <input type="text" ref={inputRefs.creditAccCode} readOnly
                                        value={formData.creditAccCode ? `${formData.creditAccCode} - ${formData.creditAccName}` : ''}
                                        onClick={() => setActiveModal('customer')}
                                        onKeyDown={e => handleKeyDown(e, 'creditAccCode')}
                                        placeholder="Select customer..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setActiveModal('customer')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Pay Type */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Type</label>
                                <div className="relative">
                                    <input type="text" ref={inputRefs.payType} readOnly
                                        value={lookups.payTypes?.find(m => m.code === formData.payType)?.name || formData.payType || ''}
                                        onClick={() => setActiveModal('payType')}
                                        onKeyDown={e => handleKeyDown(e, 'payType')}
                                        placeholder="Select pay type..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer truncate" />
                                    <button onClick={() => setActiveModal('payType')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Debit Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Debit Acc *</label>
                                <div className="relative">
                                    <input type="text" ref={inputRefs.debitAccCode} readOnly
                                        value={formData.debitAccCode ? `${formData.debitAccCode} - ${formData.debitAccName}` : ''}
                                        onClick={() => setActiveModal('debitAcc')}
                                        onKeyDown={e => handleKeyDown(e, 'debitAccCode')}
                                        placeholder="Select debit account..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setActiveModal('debitAcc')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Chq No</label>
                                <input type="text" ref={inputRefs.chequeNo} name="chequeNo"
                                    value={formData.chequeNo} onChange={handleInputChange}
                                    disabled={formData.payType !== 'CHEQUE'}
                                    onKeyDown={e => handleKeyDown(e, 'chequeNo')}
                                    placeholder="Cheque number"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 disabled:bg-gray-100 disabled:text-gray-400" />
                            </div>

                            {/* Bank / Branch */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank / Branch</label>
                                <div className="relative">
                                    <input type="text" ref={inputRefs.bank} readOnly
                                        value={formData.bank || ''}
                                        disabled={formData.payType !== 'CHEQUE'}
                                        onClick={() => formData.payType === 'CHEQUE' && setActiveModal('bank')}
                                        onKeyDown={e => handleKeyDown(e, 'bank')}
                                        placeholder="Select Bank"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer truncate disabled:bg-gray-100 disabled:text-gray-400" />
                                    <button disabled={formData.payType !== 'CHEQUE'} onClick={() => setActiveModal('bank')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer disabled:text-gray-300">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <input type="text" ref={inputRefs.branch} name="branch"
                                    value={formData.branch} onChange={handleInputChange}
                                    disabled={formData.payType !== 'CHEQUE'}
                                    onKeyDown={e => handleKeyDown(e, 'branch')}
                                    placeholder="Branch"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 mt-2" />
                            </div>

                            {/* Cheque Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Chq Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.chequeDate ? formatDateToDMY(formData.chequeDate) : ''}
                                        disabled={formData.payType !== 'CHEQUE'}
                                        onClick={() => formData.payType === 'CHEQUE' && setShowChqDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate disabled:bg-gray-100 disabled:text-gray-400" />
                                    <button disabled={formData.payType !== 'CHEQUE'} onClick={() => setShowChqDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer disabled:text-gray-300">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Memo */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Remarks / Memo</label>
                                <input type="text" ref={inputRefs.memo} name="memo"
                                    value={formData.memo} onChange={handleInputChange}
                                    onKeyDown={e => handleKeyDown(e, 'memo')}
                                    placeholder="Enter remarks..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal isOpen={activeModal === 'customer'} onClose={() => setActiveModal(null)}
                title="Select Customer (Credit Account)" items={lookups.customers} onSelect={handleSelectCustomer} />
            <SearchModal isOpen={activeModal === 'debitAcc'} onClose={() => setActiveModal(null)}
                title="Select Debit Account" items={lookups.drAccounts} onSelect={handleSelectDebitAccount} />
            <SearchModal isOpen={activeModal === 'bank'} onClose={() => setActiveModal(null)}
                title="Select Bank" items={lookups.banks} onSelect={handleSelectBank} />
            <SearchModal isOpen={activeModal === 'payType'} onClose={() => setActiveModal(null)}
                title="Select Pay Type" items={lookups.payTypes}
                onSelect={(item) => { handlePayTypeChange(item.code); setTimeout(() => { if (item.code === 'CHEQUE') { inputRefs.chequeNo.current?.focus(); } else { inputRefs.amount.current?.focus(); } }, 100); }} />

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}
                onDateSelect={(date) => { setFormData(prev => ({ ...prev, postDate: date })); setShowDatePicker(false); }}
                currentDate={formData.postDate} />

            <CalendarModal isOpen={showChqDatePicker} onClose={() => setShowChqDatePicker(false)}
                onDateSelect={(date) => { setFormData(prev => ({ ...prev, chequeDate: date })); setShowChqDatePicker(false); setTimeout(() => { inputRefs.bank.current?.focus(); }, 100); }}
                currentDate={formData.chequeDate} />

            {receiptTx && (
                <TransactionReceiptModal
                    selectedTx={receiptTx}
                    onClose={() => { setReceiptTx(null); onClose(); }}
                />
            )}
        </>
    );
};

export default CustomerAdvanceBoard;
