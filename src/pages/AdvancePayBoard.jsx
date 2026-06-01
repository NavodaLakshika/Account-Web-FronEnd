import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, Landmark, User, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { advancePayService } from '../services/advancePay.service';

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

// Generic Search Modal following the high-fidelity style of JournalEntryBoard
const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item => 
        (item.name || '').toLowerCase().includes(query.toLowerCase()) || 
        (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[600px]">
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white">
                    <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-8 pl-10 pr-4 border border-slate-200 px-3 text-sm bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="border border-slate-200 rounded-[5px] overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-2.5 w-32">Identifier</th>
                                    <th className="px-5 py-2.5">Credential / Name</th>
                                    <th className="px-5 py-2.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-20 text-center text-gray-300 font-mono font-bold uppercase tracking-widest text-[10px]">
                                            No matching records discovered
                                        </td>
                                    </tr>
                                ) : filtered.map((item, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="group hover:bg-slate-50 cursor-pointer transition-all" 
                                        onClick={() => { onSelect(item); onClose(); }}
                                    >
                                        <td className="px-5 py-2.5 font-mono text-[12px] text-slate-700">{item.code}</td>
                                        <td className="px-5 py-2.5 text-[12px] font-bold text-slate-700 uppercase group-hover:text-[#0285fd] transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-2.5 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[9px] px-4 py-1.5 rounded-[5px] font-mono font-bold uppercase tracking-widest hover:bg-[#cb9b34] transition-all active:scale-95 border-none">
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

const AdvancePayBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ vendors: [], accounts: [], costCenters: [] });
    const [loading, setLoading] = useState(false);
    
    // Cheque Validation state
    const [chequeStatus, setChequeStatus] = useState('idle'); // 'idle', 'checking', 'valid', 'invalid'
    const [chequeMessage, setChequeMessage] = useState('');

    // Form States
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
                costCenters: data.costCenters || []
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
            chqNo: type === 'Cheque' ? prev.chqNo : '',
            chqDate: type === 'Cheque' ? prev.chqDate : prev.postDate
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
        if (formData.payType === 'Cheque') {
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
            handleClear();
            onClose();
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
                title="Advance Issued (Advance Pay)"
                maxWidth="max-w-6xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div>
                            <button 
                                onClick={handleClear} 
                                disabled={loading} 
                                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSave} 
                                disabled={loading} 
                                className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Unified Fields Grid */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* A/P Account */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">A/P Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.apAccount ? `${formData.apAccount} - ${formData.apAccountName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setActiveModal('account')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('account')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Document ID */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Doc ID</label>
                                <input 
                                    type="text" 
                                    value={formData.docNo} 
                                    readOnly 
                                    className="flex-1 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-blue-600 bg-slate-50 rounded outline-none" 
                                />
                            </div>

                            {/* Supplier / Vendor */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Supplier</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.vendId ? `${formData.vendId} - ${formData.vender}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setActiveModal('vendor')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('vendor')} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Post Date */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
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

                            {/* From Cost Center */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">From CC</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.fromCostCenter)?.name || formData.fromCostCenter || ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-2.5 text-sm font-mono text-slate-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setActiveModal('fromCc')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('fromCc')} 
                                        className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* To Cost Center */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-20 shrink-0 text-right pr-2">To CC</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter || ''} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-2.5 text-sm font-mono text-slate-700 bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                        onClick={() => setActiveModal('toCc')}
                                    />
                                    <button 
                                        onClick={() => setActiveModal('toCc')} 
                                        className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Vouch No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Vouch No</label>
                                <input 
                                    name="vouNo" 
                                    value={formData.vouNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-slate-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                            {/* Address */}
                            <div className="col-span-8 flex items-start gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 mt-1.5">Address</label>
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleInputChange} 
                                    rows="2" 
                                    className="flex-1 border border-slate-200 px-3 py-2 text-sm font-mono rounded outline-none bg-slate-50 resize-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                            {/* Ref No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Ref No</label>
                                <input 
                                    name="refNo" 
                                    value={formData.refNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-slate-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>

                            {/* Memo */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Memo</label>
                                <input 
                                    name="memo" 
                                    value={formData.memo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-slate-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                />
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="pt-5 border-t border-slate-200 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Pay Method</label>
                                <div className="flex gap-2">
                                    {['Cash', 'Cheque', 'Online'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handlePayTypeChange(type)}
                                            className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-[5px] border transition-all active:scale-95 ${
                                                formData.payType === type
                                                    ? 'bg-[#0285fd] text-white border-[#0285fd] shadow-md shadow-blue-100'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                                {/* Amount Input */}
                                <div className="col-span-4 flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Net Amount</label>
                                    <input 
                                        name="amount" 
                                        value={formData.amount} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.01" 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm text-right font-black text-[#b91c1c] bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 font-mono" 
                                    />
                                </div>
                                
                                {/* Cheque Number */}
                                <div className="col-span-4 flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Cheque No</label>
                                    <div className="relative flex-1">
                                        <input 
                                            name="chqNo" 
                                            value={formData.chqNo} 
                                            onChange={handleInputChange} 
                                            onBlur={handleChequeBlur}
                                            disabled={formData.payType !== 'Cheque'} 
                                            type="text" 
                                            className="w-full h-8 border border-slate-200 px-3 pr-8 text-sm font-bold rounded outline-none disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 font-mono bg-slate-50 transition-all" 
                                        />
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                                            {chequeStatus === 'checking' && <Loader2 size={14} className="animate-spin text-blue-500" />}
                                            {chequeStatus === 'valid' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                            {chequeStatus === 'invalid' && <AlertCircle size={14} className="text-rose-500" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Cheque Date */}
                                <div className="col-span-4 flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right pr-2">Cheq Date</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.chqDate ? formatDateToDMY(formData.chqDate) : ''} 
                                            disabled={formData.payType !== 'Cheque'} 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-slate-700 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50 rounded outline-none cursor-pointer transition-all"
                                            onClick={() => formData.payType === 'Cheque' && setShowChqDatePicker(true)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowChqDatePicker(true)} 
                                            disabled={formData.payType !== 'Cheque'} 
                                            className="w-10 h-8 bg-[#0285fd] disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

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
        </>
    );
};

export default AdvancePayBoard;
