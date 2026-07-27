import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    RotateCcw, 
    Save, 
    Trash2, 
    Loader2, 
    CheckCircle,
    PenTool,
    DollarSign,
    ChevronDown
} from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { writeChequeService } from '../services/writeCheque.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const WriteChequeBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Expenses');
    
    // UI States
    const [showBankModal, setShowBankModal] = useState(false);
    const [showCCModal, setShowCCModal] = useState(false);
    const [showEndorsementModal, setShowEndorsementModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showPayeeModal, setShowPayeeModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [payeeType, setPayeeType] = useState('Customer');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);
    const [ccSource, setCcSource] = useState('header');
    const [ccIndex, setCcIndex] = useState(0);
    const [accIndex, setAccIndex] = useState(0);
    const [itemIndex, setItemIndex] = useState(0);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);

    // Search States
    const [bankSearch, setBankSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [savedDocs, setSavedDocs] = useState([]);
    const [appliedDocs, setAppliedDocs] = useState([]);
    const [searchTab, setSearchTab] = useState('draft');
    const [docSearchQuery, setDocSearchQuery] = useState('');
    const [showVoidReasonModal, setShowVoidReasonModal] = useState(false);
    const [voidReason, setVoidReason] = useState('');

    const getInitialFormData = () => ({
        docId: '',
        date: new Date().toLocaleDateString('en-GB'),
        bankAcc: '',
        costCenter: '',
        endorsement: 'A/C PAYEE ONLY',
        payeeId: '',
        payeeName: '',
        address: '',
        isElectronic: false,
        chqNo: '',
        chqDate: new Date().toLocaleDateString('en-GB'),
        isChqNoManual: false,
        totalAmount: 0,
        bankBalance: 0,
        company: '',
        isApplied: false,
        isVoided: false
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [expenses, setExpenses] = useState([]);
    const [items, setItems] = useState([]);
    
    const [lookups, setLookups] = useState({
        banks: [],
        costCenters: [],
        endorsements: [],
        accounts: [],
        products: [],
        customers: [],
        vendors: []
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            setExpenses([]);
            setItems([]);
            initData();
        }
    }, [isOpen]);

    const initData = async () => {
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            const data = await writeChequeService.getInitData(companyCode);
            
            try {
                const docs = await writeChequeService.searchSaved(companyCode);
                setSavedDocs(docs || []);
            } catch (err) {
                console.error("Failed to load saved docs", err);
            }
            
            setLookups(prev => ({
                ...prev,
                banks: data.bankAccounts || [],
                costCenters: data.costCenters || [],
                endorsements: data.endorsements || [],
                accounts: data.accounts || [],
                products: data.products || [],
                customers: data.customers || [],
                vendors: data.vendors || []
            }));

            setFormData(prev => ({
                ...prev,
                docId: data.docNo,
                company: companyCode
            }));
        } catch (error) {
            showErrorToast('Failed to initialize Write Cheque module.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBankBalance = async (bankCode) => {
        try {
            const { companyCode } = getSessionData();
            const { balance } = await writeChequeService.getBankBalance(bankCode, companyCode);
            setFormData(prev => ({ ...prev, bankBalance: balance }));
        } catch (error) {
            console.error('Failed to fetch bank balance', error);
        }
    };

    const handleApply = async () => {
        if (!formData.docId) return showErrorToast('Document ID is required. Please reload if it failed to generate.');
        if (!formData.bankAcc) return showErrorToast('Select settlement bank.');
        if (!formData.payeeId) return showErrorToast('Select a Pay to Order (Customer/Vendor).');
        if (expenses.length === 0 && items.length === 0) return showErrorToast('Add at least one line item (Expense or Item).');
        
        const totalAmount = calculateTotal();
        if (totalAmount <= 0) return showErrorToast('Total amount must be greater than zero.');

        setLoading(true);
        setLoading(true);
        try {
            await writeChequeService.clearDraft(formData.docId, formData.company).catch(() => {});

            for (const exp of expenses) {
                if (!exp.accCode) continue;
                await writeChequeService.tempSaveExpense({
                    DocNo: formData.docId,
                    Company: formData.company,
                    VendorId: formData.payeeId,
                    AccCode: exp.accCode,
                    AccName: lookups.accounts.find(a => a.code === exp.accCode)?.name || '',
                    Amount: parseFloat(exp.amount) || 0,
                    TotalAmount: totalAmount,
                    Memo: exp.memo,
                    CustJob: '',
                    Date: formData.date,
                    IdNo: '0',
                    Type: 'WCH',
                    CostCode: exp.costCenter || formData.costCenter,
                    CostName: lookups.costCenters.find(cc => cc.costCenterCode === (exp.costCenter || formData.costCenter))?.costCenterName || ''
                });
            }

            for (const item of items) {
                if (!item.itemCode) continue;
                await writeChequeService.tempSaveItem({
                    DocNo: formData.docId,
                    Company: formData.company,
                    VendorId: formData.payeeId,
                    ItemId: item.itemCode,
                    Description: item.description,
                    Qty: parseInt(item.qty) || 0,
                    Cost: parseFloat(item.cost) || 0,
                    CustJob: '',
                    TotalAmount: totalAmount,
                    Date: formData.date,
                    IdNo: '0',
                    Type: 'WCH'
                });
            }

            // Must save header into temporary table before applying, just like Save Draft does
            await writeChequeService.saveHeader({
                DocNo: formData.docId,
                BankCode: formData.bankAcc,
                VendorId: formData.payeeId,
                Memo: formData.address,
                ChequeNo: formData.chqNo,
                Date: formData.date,
                RefNo: formData.docId,
                TotalAmount: totalAmount,
                ChequeDate: formData.chqDate,
                Company: formData.company,
                Payee: formData.payeeName
            });

            const result = await writeChequeService.apply({
                DocNo: formData.docId,
                Company: formData.company,
                Date: formData.date,
                NetAmount: totalAmount,
                BankCode: formData.bankAcc,
                Payee: formData.payeeName,
                IsOnline: formData.isElectronic
            });

            showSuccessToast(`Cheque applied successfully. Doc: ${result.appDocNo}`);
            if (result.appDocNo) {
                await handleLoadDoc(result.appDocNo);
            } else {
                handleClear();
            }
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.docId) return showErrorToast('Document ID is required. Please reload if it failed to generate.');
        if (!formData.bankAcc) return showErrorToast('Select settlement bank.');
        if (!formData.payeeId) return showErrorToast('Select a Pay to Order (Customer/Vendor).');
        if (expenses.length === 0 && items.length === 0) return showErrorToast('Add at least one line item (Expense or Item).');
        
        const totalAmount = calculateTotal();
        if (totalAmount <= 0) return showErrorToast('Total amount must be greater than zero.');

        setLoading(true);
        try {
            await writeChequeService.clearDraft(formData.docId, formData.company).catch(() => {});

            for (const exp of expenses) {
                if (!exp.accCode) continue;
                await writeChequeService.tempSaveExpense({
                    DocNo: formData.docId,
                    Company: formData.company,
                    VendorId: formData.payeeId,
                    AccCode: exp.accCode,
                    AccName: lookups.accounts.find(a => a.code === exp.accCode)?.name || '',
                    Amount: parseFloat(exp.amount) || 0,
                    TotalAmount: totalAmount,
                    Memo: exp.memo,
                    CustJob: '',
                    Date: formData.date,
                    IdNo: '0',
                    Type: 'WCH',
                    CostCode: exp.costCenter || formData.costCenter,
                    CostName: lookups.costCenters.find(cc => cc.costCenterCode === (exp.costCenter || formData.costCenter))?.costCenterName || ''
                });
            }

            for (const item of items) {
                if (!item.itemCode) continue;
                await writeChequeService.tempSaveItem({
                    DocNo: formData.docId,
                    Company: formData.company,
                    VendorId: formData.payeeId,
                    ItemId: item.itemCode,
                    Description: item.description,
                    Qty: parseInt(item.qty) || 0,
                    Cost: parseFloat(item.cost) || 0,
                    CustJob: '',
                    TotalAmount: totalAmount,
                    Date: formData.date,
                    IdNo: '0',
                    Type: 'WCH'
                });
            }

            await writeChequeService.saveHeader({
                DocNo: formData.docId,
                BankCode: formData.bankAcc,
                VendorId: formData.payeeId,
                Memo: formData.address,
                ChequeNo: formData.chqNo,
                Date: formData.date,
                RefNo: formData.chqNo,
                TotalAmount: totalAmount,
                ChequeDate: formData.chqDate,
                Company: formData.company,
                Payee: formData.payeeName
            });

            showSuccessToast(`Draft saved successfully.`);
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setExpenses([]);
        setItems([]);
        setFormData(prev => ({
            ...prev,
            bankAcc: '',
            costCenter: '',
            payeeId: '',
            payeeName: '',
            address: '',
            chqNo: '',
            totalAmount: 0,
            bankBalance: 0,
            endorsement: 'A/C PAYEE ONLY',
            isApplied: false,
            isVoided: false
        }));
        initData();
    };

    const handleOpenSearch = async () => {
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            const docs = await writeChequeService.searchSaved(companyCode);
            const applied = await writeChequeService.searchApplied(companyCode);
            setSavedDocs(docs || []);
            setAppliedDocs(applied || []);
            setSearchTab('draft');
            setShowSearchModal(true);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleLoadDoc = async (docNo) => {
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            const { header, expenses: loadedExpenses, items: loadedItems, isApplied } = await writeChequeService.loadSaved(docNo, companyCode);
            
            setFormData(prev => ({
                ...prev,
                docId: header.docNo,
                date: header.date,
                bankAcc: header.bankCode,
                payeeName: header.payee,
                payeeId: header.payeeId,
                address: header.address,
                chqNo: header.chequeNo,
                totalAmount: header.totalAmount,
                costCenter: (loadedExpenses && loadedExpenses.length > 0) ? loadedExpenses[0].costCenter : '',
                isApplied: isApplied,
                isVoided: searchTab === 'applied' ? appliedDocs.find(d => d.docNo === docNo)?.cancel === 'T' : false
            }));

            setExpenses((loadedExpenses || []).map(exp => ({
                accCode: exp.accCode,
                accName: exp.accName,
                amount: exp.amount,
                memo: exp.memo,
                costCenter: exp.costCenter
            })));

            setItems((loadedItems || []).map(item => ({
                itemCode: item.itemCode,
                description: item.description,
                qty: item.qty,
                cost: item.cost
            })));

            setShowSearchModal(false);
            showSuccessToast(`Loaded Document ${docNo}`);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        const expTotal = expenses.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
        const itemTotal = items.reduce((sum, line) => sum + ((parseFloat(line.cost) || 0) * (parseInt(line.qty) || 0)), 0);
        return expTotal + itemTotal;
    };

    const openCalendar = (field) => {
        setCalendarField(field);
        setShowCalendar(true);
    };

    const handleDateSelect = (date) => {
        if (calendarField) {
            setFormData(prev => ({ ...prev, [calendarField]: date }));
        }
        setShowCalendar(false);
    };

    const handleVoidSubmit = async () => {
        if (!voidReason.trim()) {
            showErrorToast('Please enter a void reason');
            return;
        }
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            await writeChequeService.voidDoc({
                docNo: formData.docId,
                company: companyCode,
                user: getSessionData().userName || 'System',
                reason: voidReason
            });
            showSuccessToast('Document voided successfully.');
            setShowVoidReasonModal(false);
            setVoidReason('');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
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
                title="Write Cheque Portfolio"
                subtitle="Write Cheque"
                icon={PenTool}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {!formData.isApplied && (
                                <button onClick={() => setShowVoidConfirm(true)} className="px-6 h-10 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 border border-red-200">
                                    <Trash2 size={14} /> DELETE DRAFT
                                </button>
                            )}
                            {formData.isApplied && !formData.isVoided && (
                                <button onClick={() => setShowVoidReasonModal(true)} className="px-6 h-10 bg-red-500 text-white hover:bg-red-600 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> VOID DOC
                                </button>
                            )}
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                            <button onClick={handleOpenSearch} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Search size={14} /> SEARCH
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSaveDraft} disabled={loading || formData.isApplied} className={`px-6 h-10 border border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${(loading || formData.isApplied) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE DRAFT
                            </button>
                            <button onClick={handleApply} disabled={loading || formData.isApplied} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${(loading || formData.isApplied) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma']">
                    {/* Header Information Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                            <div className="">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <label className="block text-[13px] font-medium text-gray-700">Document ID</label>
                                    {formData.isVoided && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">VOIDED</span>}
                                    {formData.isApplied && !formData.isVoided && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 border border-green-200">APPLIED</span>}
                                </div>
                                <select
                                    value={formData.docId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && val !== formData.docId) {
                                            handleLoadDoc(val);
                                        }
                                    }}
                                    className="w-[590px] h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white flex items-center text-gray-700 font-mono font-bold outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                >
                                    {!savedDocs.find(d => d.docNo === formData.docId) && formData.docId && (
                                        <option value={formData.docId}>{formData.docId} (New)</option>
                                    )}
                                    {savedDocs.map((doc, idx) => (
                                        <option key={idx} value={doc.docNo}>
                                            {doc.docNo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Dispatch Date</label>
                                <div className="relative w-full">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.date} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={() => openCalendar('date')}
                                    />
                                    <button onClick={() => openCalendar('date')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Settlement Bank</label>
                                    <div className="relative">
                                        <select
                                            value={formData.bankAcc || ''}
                                            onChange={(ev) => {
                                                const val = ev.target.value;
                                                const b = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                if (b) {
                                                    setFormData({...formData, bankAcc: b.code});
                                                    fetchBankBalance(b.code);
                                                }
                                            }}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {(lookups.banks || []).map((b, idx) => (
                                                <option key={idx} value={b.code || b.itemId || b.id || b.name || b}>
                                                    {b.code ? `${b.code} - ${b.name}` : (b.itemId ? `${b.itemId} - ${b.itemName || b.name}` : (b.name || b))}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.bankAcc && (
                                        <div className="mt-1.5 px-3 h-8 bg-blue-50 flex items-center justify-between rounded-[3px] border border-blue-100">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Bank Balance</span>
                                            <span className="text-[13px] font-mono font-black text-blue-700">{formData.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                    <div className="relative">
                                        <select
                                            value={formData.costCenter || ''}
                                            onChange={(e) => setFormData({...formData, costCenter: e.target.value})}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {(lookups.costCenters || []).map((c, idx) => (
                                                <option key={idx} value={c.costCenterCode || c.code}>
                                                    {c.costCenterCode || c.code} - {c.costCenterName || c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Endorsement</label>
                                    <div className="relative">
                                        <select
                                            value={formData.endorsement || ''}
                                            onChange={(e) => setFormData({...formData, endorsement: e.target.value})}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {lookups.endorsements.map((opt, idx) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay to Order</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                        value={formData.payeeId}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const dataSource = payeeType === 'Vendor' ? lookups.vendors : lookups.customers;
                                            const c = (dataSource || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (c) {
                                                setFormData({...formData, payeeId: c.code || c.id || c.itemId, payeeName: c.name});
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {((payeeType === 'Vendor' ? lookups.vendors : lookups.customers) || []).map((c, idx) => (
                                            <option key={idx} value={c.code || c.itemId || c.id || c.name || c}>
                                                {c.code ? `${c.code} - ${c.name}` : (c.itemId ? `${c.itemId} - ${c.itemName || c.name}` : (c.name || c))}
                                            </option>
                                        ))}
                                    </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <input 
                                                type="text" 
                                                value={formData.payeeName} 
                                                onChange={(e) => setFormData({...formData, payeeName: e.target.value})}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                                placeholder="Payee Name"
                                            />
                                        </div>
                                        <button onClick={() => {
                                            setPayeeType(prev => prev === 'Customer' ? 'Vendor' : 'Customer');
                                            setFormData({...formData, payeeId: '', payeeName: ''});
                                        }} className="h-10 px-4 bg-white border border-[#0285fd] text-[#0285fd] font-semibold rounded-[3px] text-[13px] hover:bg-blue-50 transition-all flex items-center justify-center whitespace-nowrap gap-1">
                                            <RotateCcw size={14} /> LOAD {payeeType === 'Customer' ? 'VENDORS' : 'CUSTOMERS'}
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Postal Address</label>
                                    <textarea 
                                        className="w-full h-[82px] border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none" 
                                        value={formData.address} 
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        placeholder="Enter postal address..."
                                    />
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Payable Amount</label>
                                    <div className="w-full h-10 border border-red-200 bg-red-50/50 px-3 text-[14px] font-bold text-red-600 text-right flex items-center justify-end rounded-[3px]">
                                        {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cheque Specifics Section */}
                    <div className="mt-4 grid grid-cols-12 gap-x-6">
                        <div className="col-span-7 bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Bank Submission Details</h4>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-[#0285fd] focus:ring-[#0285fd] transition-all" 
                                        checked={formData.isElectronic} 
                                        onChange={(e) => setFormData({...formData, isElectronic: e.target.checked, chqNo: e.target.checked ? 'EPAY' : ''})} 
                                    />
                                    <span className="text-[11px] font-medium text-gray-600">Electronic Pay</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-slate-300 text-[#0285fd] focus:ring-[#0285fd] shrink-0" 
                                            checked={formData.isChqNoManual} 
                                            onChange={(e) => setFormData({...formData, isChqNoManual: e.target.checked})} 
                                            title="Manual entry"
                                        />
                                        <input 
                                            type="text" 
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                            value={formData.chqNo} 
                                            onChange={(e) => setFormData({...formData, chqNo: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Date</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.chqDate} 
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" 
                                            onClick={() => openCalendar('chqDate')}
                                        />
                                        <button onClick={() => openCalendar('chqDate')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 bg-blue-50/20 p-4 border border-dashed border-blue-200 rounded-[3px] flex flex-col justify-center">
                            <span className="text-[10px] font-black text-blue-400 uppercase block mb-1 tracking-wider text-right">Total Payable Disbursement</span>
                            <div className="text-[32px] font-black text-slate-900 tracking-tighter tabular-nums text-right leading-none">
                                {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Expenses/Items Portfolio Ledger Table */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelectedTab('Expenses')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${selectedTab === 'Expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Expenses
                                </button>
                                <button 
                                    onClick={() => setSelectedTab('Items')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${selectedTab === 'Items' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Items
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[250px]">
                            {selectedTab === 'Expenses' ? (
                                <>
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                            <tr>
                                                <th className="px-4 w-[5%]">#</th>
                                                <th className="px-4 w-[30%]">Ledger Selection</th>
                                                <th className="px-4 w-[20%]">Allocation CC</th>
                                                <th className="px-4 w-[15%] text-right">Net Value</th>
                                                <th className="px-4 w-[25%]">Memo</th>
                                            <th className="text-right px-5 py-3">Action</th></tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((line, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono text-gray-300">{idx + 1}</td>
                                                    <td className="px-2 py-2.5">
                                                        <div className="flex gap-1 items-center">
                                                            <select
                                                                value={line.accCode || ''}
                                                                    onChange={(ev) => {
                                                                        const val = ev.target.value;
                                                                        if (!val) {
                                                                            const newExp = [...expenses];
                                                                            newExp[idx].accCode = '';
                                                                            setExpenses(newExp);
                                                                            return;
                                                                        }
                                                                        const a = (lookups.accounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                                        if (a) {
                                                                            const newExp = [...expenses];
                                                                            newExp[idx].accCode = val;
                                                                            setExpenses(newExp);
                                                                        }
                                                                    }}
                                                                className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                                            >
                                                                <option value="">Select...</option>
                                                                {(lookups.accounts || []).map((a, i) => (
                                                                    <option key={i} value={a.code || a.itemId || a.id || a.name || a}>
                                                                        {a.code ? `${a.code} - ${a.name}` : (a.itemId ? `${a.itemId} - ${a.itemName || a.name}` : (a.name || a))}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <div className="flex gap-1 items-center">
                                                            <select
                                                                value={line.costCenter || ''}
                                                                onChange={(e) => {
                                                                    const newExp = [...expenses];
                                                                    newExp[idx].costCenter = e.target.value;
                                                                    setExpenses(newExp);
                                                                }}
                                                                className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 appearance-none"
                                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                                            >
                                                                <option value="">Cost center</option>
                                                                {(lookups.costCenters || []).map((c, i) => (
                                                                    <option key={i} value={c.costCenterCode || c.code}>
                                                                        {c.costCenterCode || c.code} - {c.costCenterName || c.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" 
                                                            value={line.amount} 
                                                            onChange={(e) => {
                                                                const newExp = [...expenses];
                                                                newExp[idx].amount = e.target.value;
                                                                setExpenses(newExp);
                                                            }} 
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                                            value={line.memo} 
                                                            onChange={(e) => {
                                                                const newExp = [...expenses];
                                                                newExp[idx].memo = e.target.value;
                                                                setExpenses(newExp);
                                                            }} 
                                                            placeholder="Memo"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-2.5 text-right">
                                                        <button 
                                                            onClick={() => setExpenses(expenses.filter((_, i) => i !== idx))} 
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-[3px] transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {expenses.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="py-16 text-center text-gray-300 font-black text-[11px] uppercase tracking-widest">No expense items added.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2">
                                        <button 
                                            onClick={() => setExpenses([...expenses, { accCode: '', costCenter: '', amount: '0.00', memo: '' }])} 
                                            className="w-full py-2.5 text-[#0285fd] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border border-dashed border-[#0285fd]/30 rounded-[3px] bg-transparent"
                                        >
                                            <Save size={12} /> ADD EXPENSE LINE
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                            <tr>
                                                <th className="px-4 w-[5%]">#</th>
                                                <th className="px-4 w-[35%]">Item Description</th>
                                                <th className="px-4 w-[12%] text-center">Qty</th>
                                                <th className="px-4 w-[15%] text-right">Unit Cost</th>
                                                <th className="px-4 w-[15%] text-right">Sub Total</th>
                                                <th className="px-4 w-[18%]">Memo</th>
                                            <th className="text-right px-5 py-3">Action</th></tr>
                                        </thead>
                                        <tbody>
                                            {items.map((line, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono text-gray-300">{idx + 1}</td>
                                                    <td className="px-2 py-2.5">
                                                        <div className="flex gap-1 items-center">
                                                            <select
                                                                value={line.itemCode || ''}
                                                                    onChange={(ev) => {
                                                                        const val = ev.target.value;
                                                                        if (!val) {
                                                                            const newItems = [...items];
                                                                            newItems[idx].itemCode = '';
                                                                            setItems(newItems);
                                                                            return;
                                                                        }
                                                                        const p = (lookups.products || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                                        if (p) {
                                                                            const newItems = [...items];
                                                                            newItems[idx].itemCode = val;
                                                                            setItems(newItems);
                                                                        }
                                                                    }}
                                                                className="flex-1 h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                                            >
                                                                <option value="">Select...</option>
                                                                {(lookups.products || []).map((p, i) => (
                                                                    <option key={i} value={p.code || p.itemId || p.id || p.name || p}>
                                                                        {p.code ? `${p.code} - ${p.name || p.prod_Name}` : (p.itemId ? `${p.itemId} - ${p.itemName || p.name}` : (p.name || p))}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <input 
                                                            type="number" 
                                                            className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" 
                                                            value={line.qty} 
                                                            onChange={(e) => {
                                                                const newItems = [...items];
                                                                newItems[idx].qty = e.target.value;
                                                                setItems(newItems);
                                                            }} 
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" 
                                                            value={line.cost} 
                                                            onChange={(e) => {
                                                                const newItems = [...items];
                                                                newItems[idx].cost = e.target.value;
                                                                setItems(newItems);
                                                            }} 
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-black text-gray-700 bg-gray-50/30">
                                                        {((parseFloat(line.cost) || 0) * (parseInt(line.qty) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <input 
                                                            type="text" 
                                                            className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" 
                                                            value={line.description} 
                                                            onChange={(e) => {
                                                                const newItems = [...items];
                                                                newItems[idx].description = e.target.value;
                                                                setItems(newItems);
                                                            }} 
                                                            placeholder="Memo"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-2.5 text-right">
                                                        <button 
                                                            onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-[3px] transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="py-16 text-center text-gray-300 font-black text-[11px] uppercase tracking-widest">No items added.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2">
                                        <button 
                                            onClick={() => setItems([...items, { itemCode: '', description: '', qty: '1', cost: '0.00' }])} 
                                            className="w-full py-2.5 text-[#0285fd] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border border-dashed border-[#0285fd]/30 rounded-[3px] bg-transparent"
                                        >
                                            <Save size={12} /> ADD ITEM LINE
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Validation Summary */}
                    <div className="mt-4 bg-white p-3 border border-slate-200 rounded-[3px] flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 block">Accounting Delta</span>
                                <span className="text-[18px] font-mono font-black text-slate-800 tracking-tighter">
                                    {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Entry Validated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Bank Search Modal */}
            <SimpleModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title={`Bank Accounts - ${lookups.banks.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={bankSearch} 
                            onChange={(e) => setBankSearch(e.target.value)} 
                            placeholder="Search by name..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Bank Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map((b, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{b.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{b.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData({...formData, bankAcc: b.code});
                                                fetchBankBalance(b.code);
                                                setShowBankModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal removed */}

            {/* Endorsement Modal removed */}

            {/* Account Search Modal */}
            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Ledger Accounts - ${lookups.accounts.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={accSearch} 
                            onChange={(e) => setAccSearch(e.target.value)} 
                            placeholder="Filter accounts..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.accounts.filter(a => a.name.toLowerCase().includes(accSearch.toLowerCase()) || a.code.includes(accSearch)).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                const newExp = [...expenses];
                                                newExp[accIndex].accCode = a.code || a.itemId || a.id || a.name || a;
                                                setExpenses(newExp);
                                                setShowAccModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Item Search Modal */}
            <SimpleModal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={`Inventory Products - ${lookups.products.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={itemSearch} 
                            onChange={(e) => setItemSearch(e.target.value)} 
                            placeholder="Search products..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Product Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.products.filter(p => (p.prod_Name || '').toLowerCase().includes((itemSearch || '').toLowerCase()) || (p.code || '').includes(itemSearch)).map((p, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.prod_Name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                const newItems = [...items];
                                                newItems[itemIndex].itemCode = p.code || p.itemId || p.id || p.name || p;
                                                newItems[itemIndex].description = p.prod_Name;
                                                setItems(newItems);
                                                setShowItemModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Payee Search Modal */}
            <SimpleModal isOpen={showPayeeModal} onClose={() => setShowPayeeModal(false)} title={`Payee Records - ${lookups.customers.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={formData.payeeName}
                            onChange={(e) => setFormData({...formData, payeeName: e.target.value})} 
                            placeholder="Search payees..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Payee Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.customers.filter(c => c.name.toLowerCase().includes((formData.payeeName || '').toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData({...formData, payeeId: c.code, payeeName: c.name});
                                                setShowPayeeModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Supplier / Vendor - ${lookups.vendors.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={docSearchQuery}
                            onChange={(e) => setDocSearchQuery(e.target.value)} 
                            placeholder="Search vendors..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Supplier Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.vendors.filter(v => 
                                    (v.name?.toLowerCase() || '').includes(docSearchQuery.toLowerCase()) || 
                                    (v.id?.toLowerCase() || '').includes(docSearchQuery.toLowerCase())
                                ).map((v, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.id}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData({...formData, payeeId: v.id, payeeName: v.name, address: v.address});
                                                setShowVendorModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Saved Cheques Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title={`Search Documents`} maxWidth="max-w-[900px]">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex bg-slate-100 p-1 border-b border-gray-200 gap-1 rounded-t-[5px]">
                        <button 
                            onClick={() => setSearchTab('draft')}
                            className={`flex-1 py-2 text-[12px] font-bold rounded-[3px] transition-all ${searchTab === 'draft' ? 'bg-white text-[#0285fd] shadow-sm' : 'text-gray-500 hover:bg-slate-200'}`}
                        >
                            DRAFTS ({savedDocs.length})
                        </button>
                        <button 
                            onClick={() => setSearchTab('applied')}
                            className={`flex-1 py-2 text-[12px] font-bold rounded-[3px] transition-all ${searchTab === 'applied' ? 'bg-white text-[#0285fd] shadow-sm' : 'text-gray-500 hover:bg-slate-200'}`}
                        >
                            APPLIED ({appliedDocs.length})
                        </button>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={docSearchQuery} 
                            onChange={(e) => setDocSearchQuery(e.target.value)} 
                            placeholder="Enter Doc No or Payee..."
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Doc No</th>
                                    <th className="border-b px-5 py-3">Date</th>
                                    <th className="border-b px-5 py-3">Payee</th>
                                    <th className="border-b px-5 py-3">Bank</th>
                                    <th className="border-b text-right px-5 py-3">Amount</th>
                                    <th className="border-b text-center px-5 py-3">Status</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(searchTab === 'draft' ? savedDocs : appliedDocs).filter(d => 
                                    (d.docNo?.toLowerCase() || '').includes(docSearchQuery.toLowerCase()) || 
                                    (d.payee?.toLowerCase() || '').includes(docSearchQuery.toLowerCase())
                                ).map((d, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.docNo}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.date}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{d.payee}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{d.bankCode}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3 text-right">{d.amount?.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                        <td className="text-center px-5 py-3">
                                            {searchTab === 'draft' ? 
                                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">DRAFT</span> 
                                                : d.cancel === 'T' ? 
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded">VOIDED</span> 
                                                : <span className="text-[10px] font-bold text-green-500 bg-green-50 border border-green-200 px-2 py-0.5 rounded">APPLIED</span>
                                            }
                                        </td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3 text-center">
                                            <button onClick={() => handleLoadDoc(d.docNo)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {(searchTab === 'draft' ? savedDocs : appliedDocs).length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No documents found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Void Reason Modal */}
            <SimpleModal isOpen={showVoidReasonModal} onClose={() => setShowVoidReasonModal(false)} title="Void Document">
                <div className="p-5 font-['Tahoma']">
                    <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                        You are about to void the applied document <strong className="font-mono text-red-500">{formData.docId}</strong>.<br/>
                        This will reverse all generated accounting and inventory entries. This action cannot be undone.
                    </p>
                    <label className="block text-[12px] font-bold text-gray-700 uppercase mb-2 tracking-wide">Reason for Voiding</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-[3px] p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none h-24 mb-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                        placeholder="Please enter a valid reason..."
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setShowVoidReasonModal(false)} className="px-5 py-2 text-[12px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-[3px] uppercase tracking-wide transition-colors">Cancel</button>
                        <button onClick={handleVoidSubmit} disabled={loading} className="px-5 py-2 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-[3px] shadow-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors disabled:opacity-50 min-w-[120px]">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Void'}
                        </button>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData.date}
            />

            <ConfirmModal 
                isOpen={showVoidConfirm}
                onClose={() => setShowVoidConfirm(false)}
                onConfirm={async () => {
                    try {
                        await writeChequeService.clearDraft(formData.docId, formData.company);
                        handleClear();
                        setShowVoidConfirm(false);
                        onClose();
                        showSuccessToast('Draft deleted successfully.');
                    } catch (err) {
                        showErrorToast(err.toString());
                    }
                }}
                title="Void Transaction Portfolio?"
                message="This will reset all current entries and discard the pending cheque sequence. This action cannot be reversed within this session."
                variant="danger"
                confirmText="Yes, Void Doc"
            />
        </>
    );
};

export default WriteChequeBoard;
