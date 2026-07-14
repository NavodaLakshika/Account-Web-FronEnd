import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, Save, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { advancePayService } from '../services/advancePay.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SearchableSelect from '../components/SearchableSelect';

const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
};

// Generic Search Modal following the high-fidelity style of JournalEntryBoard
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

const AdvancePayBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ vendors: [], accounts: [], costCenters: [], payTypes: [] });
    const [loading, setLoading] = useState(false);
    
    // Cheque Validation state
    const [chequeStatus, setChequeStatus] = useState('idle'); // 'idle', 'checking', 'valid', 'invalid'
    const [chequeMessage, setChequeMessage] = useState('');

    // Form States
    const [receiptTx, setReceiptTx] = useState(null);
    const getInitialFormData = () => ({
        docNo: '',
        postDate: new Date().toISOString().split('T')[0],
        fromCostCenter: '',
        costCenter: '',
        apAccount: '',
        apAccountName: '',
        vendId: '',
        vender: '',
        address: '',
        memo: '',
        amount: '',
        vouNo: '',
        refNo: '',
        chqNo: '',
        chqDate: new Date().toISOString().split('T')[0],
        company: '',
        createUser: '',
        payType: 'Cheque'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    // Custom Search Modal States
    const [activeModal, setActiveModal] = useState(null); // 'vendor', 'account', 'fromCc', 'toCc'
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showChqDatePicker, setShowChqDatePicker] = useState(false);

    // Toast Custom Layouts matching JournalEntryBoard & PurchaseOrderBoard
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
            fetchLookups(companyCode, userName);
            generateDocNo(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (companyCode, userName) => {
        try {
            const data = await advancePayService.getLookups(companyCode, userName);
            setLookups({
                vendors: data.vendors || [],
                accounts: data.accounts || [],
                costCenters: data.costCenters || [],
                payTypes: data.paymentMethods || []
            });
        } catch (error) {
            showErrorToast('Failed to load transaction lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await advancePayService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            console.error('Failed to generate doc number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'chqNo') {
            setChequeStatus('idle');
            setChequeMessage('');
        }
    };

    const handlePayTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            payType: type,
            // Clear cheque info if not cheque
            chqNo: type === 'CHEQUE' ? prev.chqNo : '',
            chqDate: type === 'CHEQUE' ? prev.chqDate : prev.postDate
        }));
        setChequeStatus('idle');
        setChequeMessage('');
    };

    // Cheque Number Realtime Validation on Blur
    const handleChequeBlur = async () => {
        const { apAccount, chqNo, company } = formData;
        if (!chqNo || !apAccount) return;

        setChequeStatus('checking');
        try {
            const result = await advancePayService.validateCheque(apAccount, chqNo, company);
            if (result.isValid) {
                setChequeStatus('valid');
                setChequeMessage('');
            } else {
                setChequeStatus('invalid');
                setChequeMessage(result.message);
                showErrorToast(result.message);
            }
        } catch {
            setChequeStatus('idle');
        }
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            fromCostCenter: '',
            costCenter: '',
            apAccount: '',
            apAccountName: '',
            vendId: '',
            vender: '',
            address: '',
            memo: '',
            amount: '',
            vouNo: '',
            refNo: '',
            chqNo: '',
            chqDate: new Date().toISOString().split('T')[0],
            payType: 'Cheque'
        }));
        setChequeStatus('idle');
        setChequeMessage('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.apAccount) return showErrorToast('A/P Account selection is required.');
        if (!formData.vendId) return showErrorToast('Vendor selection is required.');
        if (!formData.amount || parseFloat(formData.amount) <= 0) return showErrorToast('Valid Payment Amount is required.');
        if (formData.payType === 'CHEQUE') {
            if (!formData.chqNo) return showErrorToast('Cheque Number is required.');
            if (chequeStatus === 'invalid') return showErrorToast(chequeMessage || 'Please enter a valid Cheque Number.');
        }

        setLoading(true);
        const payload = {
            ...formData,
            accCode: formData.apAccount,
            accName: formData.apAccountName,
            amount: parseFloat(formData.amount) || 0,
            type: 'INSERT'
        };

        try {
            const resp = await advancePayService.save(payload);
            showSuccessToast(`Advance Payment processed successfully! Doc ID: ${resp.docNo}`);
            
            // Format receipt data
            setReceiptTx({
                type: 'ADVANCE PAY',
                docNo: resp.docNo || formData.docNo,
                date: formData.postDate,
                payee: formData.vender,
                total: parseFloat(formData.amount),
                details: {
                    header: {
                        memo: formData.memo,
                        payType: formData.payType,
                        chequeNo: formData.chqNo,
                        chequeDate: formData.chqDate,
                        customerCode: formData.vendId,
                        refNo: formData.refNo
                    },
                    expenses: [{
                        accCode: formData.apAccount,
                        amount: parseFloat(formData.amount),
                        memo: formData.apAccountName
                    }]
                }
            });

            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    // Modal Item Selection Handlers
    const handleSelectVendor = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            vendId: item.code, 
            vender: item.name, 
            address: item.address || '' 
        }));
    };

    const handleSelectAccount = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            apAccount: item.code, 
            apAccountName: item.name 
        }));
        // Reset cheque validation on account change
        setChequeStatus('idle');
        setChequeMessage('');
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Advance Pay" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Advance Issued"
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
                <div className="space-y-4">
                    {/* Unified Fields Grid */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* ROW 1 */}
                            {/* A/P Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/P Account</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.apAccount ? `${formData.apAccount} - ${formData.apAccountName}` : ''} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setActiveModal('account')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('account')} 
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Document ID */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input 
                                    type="text" 
                                    value={formData.docNo} 
                                    readOnly 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" 
                                />
                            </div>

                            {/* ROW 2 */}
                            {/* Supplier / Vendor */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.vendId ? `${formData.vendId} - ${formData.vender}` : ''} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setActiveModal('vendor')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('vendor')} 
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Post Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setShowDatePicker(true)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowDatePicker(true)} 
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* ROW 3 */}
                            {/* Address */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address</label>
                                <input 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                />
                            </div>

                            {/* Amount Input */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Net Amount *</label>
                                <input 
                                    name="amount" 
                                    value={formData.amount} 
                                    onChange={handleInputChange} 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                />
                            </div>

                            {/* ROW 4 */}
                            {/* From Cost Center */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">From CC</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.fromCostCenter)?.name || formData.fromCostCenter || ''} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setActiveModal('fromCc')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('fromCc')} 
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* To Cost Center */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">To CC</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter || ''} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => setActiveModal('toCc')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('toCc')} 
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Vouch No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vouch No</label>
                                <input 
                                    name="vouNo" 
                                    value={formData.vouNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                />
                            </div>

                            {/* ROW 5 */}
                            {/* Memo */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo</label>
                                <input 
                                    name="memo" 
                                    value={formData.memo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                />
                            </div>

                            {/* Ref No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref No</label>
                                <input 
                                    name="refNo" 
                                    value={formData.refNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                />
                            </div>

                        </div>

                        {/* ROW 6 - Payment Details (Separated by a border) */}
                        <div className="pt-4 mt-2 border-t border-slate-200">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                                {/* Pay Method */}
                                <div className="col-span-4">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Method</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.payTypes?.find(m => m.code === formData.payType)?.name || formData.payType || ''} 
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                            onClick={() => setActiveModal('payType')}
                                        />
                                        <button 
                                            onClick={() => setActiveModal('payType')} 
                                            className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Cheque Number */}
                                <div className="col-span-4">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                    <div className="relative">
                                        <input 
                                            name="chqNo" 
                                            value={formData.chqNo} 
                                            onChange={handleInputChange} 
                                            onBlur={handleChequeBlur}
                                            disabled={formData.payType !== 'CHEQUE'} 
                                            type="text" 
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 pr-10" 
                                        />
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                            {chequeStatus === 'checking' && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                            {chequeStatus === 'valid' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                            {chequeStatus === 'invalid' && <AlertCircle size={14} className="text-rose-500" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Cheque Date */}
                                <div className="col-span-4">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheq Date</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.chqDate ? formatDateToDMY(formData.chqDate) : ''} 
                                            disabled={formData.payType !== 'CHEQUE'} 
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate disabled:bg-gray-100 disabled:text-gray-400"
                                            onClick={() => formData.payType === 'CHEQUE' && setShowChqDatePicker(true)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowChqDatePicker(true)} 
                                            disabled={formData.payType !== 'CHEQUE'} 
                                            className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer disabled:text-gray-300"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Selection Search Modals */}
            <SearchModal
                isOpen={activeModal === 'vendor'}
                onClose={() => setActiveModal(null)}
                title="Supplier / Vendor Lookup"
                items={lookups.vendors}
                onSelect={handleSelectVendor}
                searchPlaceholder="Search supplier by name or code..."
            />

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="A/P Bank & Cash Accounts"
                items={lookups.accounts}
                onSelect={handleSelectAccount}
                searchPlaceholder="Search bank or cash accounts..."
            />

            <SearchModal
                isOpen={activeModal === 'fromCc'}
                onClose={() => setActiveModal(null)}
                title="From Cost Center Directory"
                items={lookups.costCenters}
                onSelect={(item) => setFormData(prev => ({ ...prev, fromCostCenter: item.code }))}
                searchPlaceholder="Search from cost center..."
            />

            <SearchModal
                isOpen={activeModal === 'toCc'}
                onClose={() => setActiveModal(null)}
                title="To Cost Center Directory"
                items={lookups.costCenters}
                onSelect={(item) => setFormData(prev => ({ ...prev, costCenter: item.code }))}
                searchPlaceholder="Search to cost center..."
            />

            <SearchModal 
                isOpen={activeModal === 'payType'} 
                onClose={() => setActiveModal(null)} 
                title="Select Pay Type" 
                items={lookups.payTypes} 
                onSelect={(item) => handlePayTypeChange(item.code)} 
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                initialDate={formData.postDate}
                onDateSelect={(date) => setFormData(prev => ({ ...prev, postDate: date }))}
            />

            <CalendarModal
                isOpen={showChqDatePicker}
                onClose={() => setShowChqDatePicker(false)}
                initialDate={formData.chqDate}
                onDateSelect={(date) => setFormData(prev => ({ ...prev, chqDate: date }))}
            />

            {receiptTx && (
                <TransactionReceiptModal 
                    selectedTx={receiptTx} 
                    onClose={() => {
                        setReceiptTx(null);
                        onClose(); // Close the main board when receipt is closed
                    }} 
                />
            )}
        </>
    );
};

export default AdvancePayBoard;
