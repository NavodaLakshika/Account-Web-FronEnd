import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, Landmark, User, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { advancePayService } from '../services/advancePay.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';
import { DotLottiePlayer } from '@dotlottie/react-player';

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

const AdvancePayBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ vendors: [], accounts: [], costCenters: [] });
    const [loading, setLoading] = useState(false);
    
    // Cheque Validation state
    const [chequeStatus, setChequeStatus] = useState('idle'); // 'idle', 'checking', 'valid', 'invalid'
    const [chequeMessage, setChequeMessage] = useState('');

    // Form States
    const [formData, setFormData] = useState({
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
        payType: 'Cheque' // Default pay type matching WinForms dropdown
    });

    // Custom Search Modal States
    const [activeModal, setActiveModal] = useState(null); // 'vendor', 'account', 'fromCc', 'toCc'
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showChqDatePicker, setShowChqDatePicker] = useState(false);

    // Toast Custom Layouts matching JournalEntryBoard & PurchaseOrderBoard
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3 font-['Tahoma']">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase font-sans">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3 font-['Tahoma']">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase font-sans">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen) {
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
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div>
                            <button 
                                onClick={handleClear} 
                                disabled={loading} 
                                className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> Clear Form
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSave} 
                                disabled={loading} 
                                className={`px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                                Save & Apply
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Unified Fields Grid */}
                    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* A/P Account */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">A/P Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.apAccount ? `${formData.apAccount} - ${formData.apAccountName}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-slate-700 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
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
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Doc ID</label>
                                <input 
                                    type="text" 
                                    value={formData.docNo} 
                                    readOnly 
                                    className="flex-1 h-8 border border-[#0285fd]/30 px-3 text-[12.5px] font-bold text-blue-600 bg-blue-50/20 rounded-[5px] outline-none shadow-inner" 
                                />
                            </div>

                            {/* Supplier / Vendor */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Supplier</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.vendId ? `${formData.vendId} - ${formData.vender}` : ''} 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
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
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''} 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-slate-700 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
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
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">From CC</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.fromCostCenter)?.name || formData.fromCostCenter || ''} 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-2.5 text-[12px] text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
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
                                <label className="text-[12.5px] font-bold text-gray-700 w-20 shrink-0 text-right pr-2">To CC</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter || ''} 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-2.5 text-[12px] text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
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
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Vouch No</label>
                                <input 
                                    name="vouNo" 
                                    value={formData.vouNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none bg-white shadow-sm focus:border-[#0285fd]" 
                                />
                            </div>

                            {/* Address */}
                            <div className="col-span-8 flex items-start gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 mt-1.5">Address</label>
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleInputChange} 
                                    rows="2" 
                                    className="flex-1 border border-gray-300 px-3 py-2 text-[12px] rounded-[5px] outline-none bg-white resize-none shadow-sm focus:border-[#0285fd] font-mono" 
                                />
                            </div>

                            {/* Ref No */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Ref No</label>
                                <input 
                                    name="refNo" 
                                    value={formData.refNo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none bg-white shadow-sm focus:border-[#0285fd]" 
                                />
                            </div>

                            {/* Memo */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                <input 
                                    name="memo" 
                                    value={formData.memo} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none bg-white shadow-sm focus:border-[#0285fd]" 
                                />
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="pt-5 border-t border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Method</label>
                                <div className="flex gap-2">
                                    {['Cash', 'Cheque', 'Online'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handlePayTypeChange(type)}
                                            className={`px-5 py-2 text-xs font-black rounded-[5px] border transition-all active:scale-95 ${
                                                formData.payType === type
                                                    ? 'bg-[#0285fd] text-white border-[#0285fd] shadow-md shadow-blue-100'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                                {/* Amount Input */}
                                <div className="col-span-4 flex items-center gap-2">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Net Amount</label>
                                    <input 
                                        name="amount" 
                                        value={formData.amount} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.01" 
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[14px] text-right font-black text-[#b91c1c] bg-white rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm font-mono" 
                                    />
                                </div>
                                
                                {/* Cheque Number */}
                                <div className="col-span-4 flex items-center gap-2">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Cheque No</label>
                                    <div className="relative flex-1">
                                        <input 
                                            name="chqNo" 
                                            value={formData.chqNo} 
                                            onChange={handleInputChange} 
                                            onBlur={handleChequeBlur}
                                            disabled={formData.payType !== 'Cheque'} 
                                            type="text" 
                                            className="w-full h-8 border border-gray-300 px-3 pr-8 text-[12px] font-bold rounded-[5px] outline-none disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#0285fd] font-mono" 
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
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 text-right pr-2">Cheq Date</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.chqDate ? formatDateToDMY(formData.chqDate) : ''} 
                                            disabled={formData.payType !== 'Cheque'} 
                                            className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-slate-700 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
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
