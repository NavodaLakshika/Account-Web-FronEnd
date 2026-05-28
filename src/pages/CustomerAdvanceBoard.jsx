import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, Banknote } from 'lucide-react';
import { customerAdvanceService } from '../services/customerAdvance.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
};

// Custom Search Modal matching AdvancePayBoard
const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item => 
        (item.name || '').toLowerCase().includes(query.toLowerCase()) || 
        (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[600px]">
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-sans"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 w-32">Identifier</th>
                                    <th className="px-5 py-3">Credential / Name</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                                            No matching records discovered
                                        </td>
                                    </tr>
                                ) : filtered.map((item, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="group hover:bg-blue-50/50 cursor-pointer transition-all" 
                                        onClick={() => { onSelect(item); onClose(); }}
                                    >
                                        <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{item.code}</td>
                                        <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 border-none uppercase">
                                                SELECT
                                            </button>
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
    const [lookups, setLookups] = useState({ customers: [], drAccounts: [], banks: [] });
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        receiptNo: '',
        postDate: new Date().toISOString().split('T')[0],
        payType: 'CASH', // Default PayType matching legacy C# code
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        bank: '',
        branch: '',
        amount: '0.00',
        debitAccCode: '810-101',
        debitAccName: 'Cash In Hand',
        creditAccCode: '',
        creditAccName: '',
        memo: '',
        company: '',
        createUser: ''
    });

    // Custom Search Modal States
    const [activeModal, setActiveModal] = useState(null); // 'customer', 'debitAcc', 'bank', 'payType'
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showChqDatePicker, setShowChqDatePicker] = useState(false);

    // Keyboard Focus References
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

    // Keyboard Focus Order Transitions
    const handleKeyDown = (e, currentField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (currentField === 'creditAccCode') {
                inputRefs.debitAccCode.current?.focus();
            } else if (currentField === 'debitAccCode') {
                inputRefs.payType.current?.focus();
            } else if (currentField === 'payType') {
                setActiveModal('payType');
            } else if (currentField === 'chequeNo') {
                setShowChqDatePicker(true);
            } else if (currentField === 'chequeDate') {
                inputRefs.bank.current?.focus();
            } else if (currentField === 'bank') {
                inputRefs.branch.current?.focus();
            } else if (currentField === 'branch') {
                inputRefs.amount.current?.focus();
            } else if (currentField === 'amount') {
                inputRefs.memo.current?.focus();
            } else if (currentField === 'memo') {
                handleSave();
            }
        }
    };

    // Toast Custom Layouts
    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
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
                banks: (data.banks || []).map(b => ({ code: b, name: b }))
            });

            // Set default debit account name if found in list
            const defaultDr = (data.drAccounts || []).find(a => a.code === '810-101');
            if (defaultDr) {
                setFormData(prev => ({ ...prev, debitAccName: defaultDr.name }));
            }
        } catch (error) {
            showErrorToast('Failed to load transaction lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await customerAdvanceService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, receiptNo: data.docNo }));
        } catch (error) {
            console.error('Failed to generate doc number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePayTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            payType: type,
            chequeNo: type === 'CHEQUE' ? prev.chequeNo : '',
            chequeDate: type === 'CHEQUE' ? prev.chequeDate : prev.postDate,
            bank: type === 'CHEQUE' ? prev.bank : '',
            branch: type === 'CHEQUE' ? prev.branch : ''
        }));
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            payType: 'CASH',
            chequeNo: '',
            chequeDate: new Date().toISOString().split('T')[0],
            bank: '',
            branch: '',
            amount: '0.00',
            debitAccCode: '810-101',
            debitAccName: 'Cash In Hand',
            creditAccCode: '',
            creditAccName: '',
            memo: ''
        }));
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.creditAccCode) return showErrorToast('Please select a customer (credit account).');
        if (!formData.debitAccCode) return showErrorToast('Please select a debit account.');
        if (!formData.amount || parseFloat(formData.amount) <= 0) return showErrorToast('Valid Payment Amount is required.');
        if (formData.payType === 'CHEQUE') {
            if (!formData.chequeNo) return showErrorToast('Cheque Number is required.');
        }

        setLoading(true);
        const payload = {
            ...formData,
            amount: parseFloat(formData.amount) || 0
        };

        try {
            const resp = await customerAdvanceService.save(payload);
            showSuccessToast(resp.message || `Customer Advance received successfully! Doc ID: ${resp.docNo}`);
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    // Modal Selection Handlers
    const handleSelectCustomer = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            creditAccCode: item.code, 
            creditAccName: item.name 
        }));
    };

    const handleSelectDebitAccount = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            debitAccCode: item.code, 
            debitAccName: item.name 
        }));
    };

    const handleSelectBank = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            bank: item.name 
        }));
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
                title="Customer Advance Receipt"
                subtitle="Customer Advances"
                icon={Banknote}
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div>
                            <button 
                                onClick={handleClear} 
                                disabled={loading} 
                                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> Clear Form
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSave} 
                                disabled={loading} 
                                className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                                Save & Apply
                            </button>                    
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Main Entry Panel */}
                    <div className="bg-white p-5 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Receipt No / Doc ID */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Doc ID</label>
                                <input 
                                    type="text" 
                                    value={formData.receiptNo} 
                                    readOnly 
                                    className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                            {/* Post Date */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Rec. Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setShowDatePicker(true)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowDatePicker(true)} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Credit Account / Customer Selection */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Customer *</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        ref={inputRefs.creditAccCode}
                                        readOnly 
                                        value={formData.creditAccCode ? `${formData.creditAccCode} - ${formData.creditAccName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-red-600 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setActiveModal('customer')}
                                        onKeyDown={(e) => handleKeyDown(e, 'creditAccCode')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('customer')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Debit Account Selection */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Debit Acc *</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        ref={inputRefs.debitAccCode}
                                        readOnly 
                                        value={formData.debitAccCode ? `${formData.debitAccCode} - ${formData.debitAccName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setActiveModal('debitAcc')}
                                        onKeyDown={(e) => handleKeyDown(e, 'debitAccCode')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('debitAcc')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Pay Type Selection */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Pay Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        ref={inputRefs.payType}
                                        readOnly 
                                        value={formData.payType} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                        onClick={() => setActiveModal('payType')}
                                        onKeyDown={(e) => handleKeyDown(e, 'payType')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('payType')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque Details (Only if PayType === 'CHEQUE') */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-20 shrink-0 text-right pr-2">Chq No</label>
                                <input 
                                    type="text" 
                                    ref={inputRefs.chequeNo}
                                    name="chequeNo" 
                                    value={formData.chequeNo} 
                                    onChange={handleInputChange} 
                                    disabled={formData.payType !== 'CHEQUE'}
                                    onKeyDown={(e) => handleKeyDown(e, 'chequeNo')}
                                    className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono rounded outline-none bg-slate-50 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-gray-100 disabled:text-gray-400" 
                                />
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-20 shrink-0 text-right pr-2">Chq Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.chequeDate ? formatDateToDMY(formData.chequeDate) : ''} 
                                        disabled={formData.payType !== 'CHEQUE'}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                                        onClick={() => formData.payType === 'CHEQUE' && setShowChqDatePicker(true)}
                                    />
                                    <button 
                                        type="button"
                                        disabled={formData.payType !== 'CHEQUE'}
                                        onClick={() => setShowChqDatePicker(true)} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none disabled:opacity-50"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bank Selection (Cheque only) */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Bank</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        ref={inputRefs.bank}
                                        readOnly 
                                        value={formData.bank || ''} 
                                        disabled={formData.payType !== 'CHEQUE'}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                                        onClick={() => formData.payType === 'CHEQUE' && setActiveModal('bank')}
                                        onKeyDown={(e) => handleKeyDown(e, 'bank')}
                                    />
                                    <button 
                                        disabled={formData.payType !== 'CHEQUE'}
                                        onClick={() => setActiveModal('bank')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none disabled:opacity-50"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Branch (Cheque only) */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Branch</label>
                                <input 
                                    type="text" 
                                    ref={inputRefs.branch}
                                    name="branch" 
                                    value={formData.branch} 
                                    onChange={handleInputChange} 
                                    disabled={formData.payType !== 'CHEQUE'}
                                    onKeyDown={(e) => handleKeyDown(e, 'branch')}
                                    className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono rounded outline-none bg-slate-50 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 disabled:bg-gray-100 disabled:text-gray-400" 
                                />
                            </div>

                            {/* Amount */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Amount *</label>
                                <input 
                                    type="number" 
                                    ref={inputRefs.amount}
                                    name="amount" 
                                    step="0.01"
                                    value={formData.amount} 
                                    onChange={handleInputChange} 
                                    onKeyDown={(e) => handleKeyDown(e, 'amount')}
                                    className="w-48 h-8 border border-slate-200 px-3 text-[14px] text-right font-black text-red-600 bg-slate-50 rounded outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                            {/* Memo */}
                            <div className="col-span-12 flex items-start gap-2 pt-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 pt-1.5">Remarks / Memo</label>
                                <input 
                                    type="text" 
                                    ref={inputRefs.memo}
                                    name="memo" 
                                    value={formData.memo} 
                                    onChange={handleInputChange} 
                                    onKeyDown={(e) => handleKeyDown(e, 'memo')}
                                    className="flex-1 h-9 border border-slate-200 px-3 text-[12px] font-mono rounded outline-none bg-slate-50 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Selection Lookups */}
            <SearchModal 
                isOpen={activeModal === 'customer'} 
                onClose={() => setActiveModal(null)} 
                title="Select Customer (Credit Account)" 
                items={lookups.customers} 
                onSelect={handleSelectCustomer} 
            />

            <SearchModal 
                isOpen={activeModal === 'debitAcc'} 
                onClose={() => setActiveModal(null)} 
                title="Select Debit Account" 
                items={lookups.drAccounts} 
                onSelect={handleSelectDebitAccount} 
            />

            <SearchModal 
                isOpen={activeModal === 'bank'} 
                onClose={() => setActiveModal(null)} 
                title="Select Bank" 
                items={lookups.banks} 
                onSelect={handleSelectBank} 
            />

            <SearchModal 
                isOpen={activeModal === 'payType'} 
                onClose={() => setActiveModal(null)} 
                title="Select Pay Type" 
                items={[
                    { code: 'CASH', name: 'CASH' },
                    { code: 'CHEQUE', name: 'CHEQUE' }
                ]} 
                onSelect={(item) => {
                    handlePayTypeChange(item.code);
                    setTimeout(() => {
                        if (item.code === 'CHEQUE') {
                            inputRefs.chequeNo.current?.focus();
                        } else {
                            inputRefs.amount.current?.focus();
                        }
                    }, 100);
                }} 
            />

            {/* Date Pickers */}
            <CalendarModal 
                isOpen={showDatePicker} 
                onClose={() => setShowDatePicker(false)} 
                onSelectDate={(date) => {
                    setFormData(prev => ({ ...prev, postDate: date }));
                    setShowDatePicker(false);
                }} 
                currentDate={formData.postDate} 
            />

            <CalendarModal 
                isOpen={showChqDatePicker} 
                onClose={() => setShowChqDatePicker(false)} 
                onSelectDate={(date) => {
                    setFormData(prev => ({ ...prev, chequeDate: date }));
                    setShowChqDatePicker(false);
                    // Focus on next element bank after selecting cheque date
                    setTimeout(() => {
                        inputRefs.bank.current?.focus();
                    }, 100);
                }} 
                currentDate={formData.chequeDate} 
            />
        </>
    );
};

export default CustomerAdvanceBoard;
