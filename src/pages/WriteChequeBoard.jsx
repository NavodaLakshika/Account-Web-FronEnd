import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    RotateCcw, 
    Save, 
    Trash2, 
    Loader2, 
    Landmark,
    ChevronRight,
    ChevronDown,
    X,
    Plus,
    Package,
    Receipt,
    CheckCircle
} from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
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
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);
    const [ccSource, setCcSource] = useState('header'); // header or line
    const [ccIndex, setCcIndex] = useState(0);
    const [accIndex, setAccIndex] = useState(0);
    const [itemIndex, setItemIndex] = useState(0);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);

    // Search States
    const [savedDocs, setSavedDocs] = useState([]);
    const [docSearchQuery, setDocSearchQuery] = useState('');

    // Search States
    const [bankSearch, setBankSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    const getInitialFormData = () => ({
        docId: '',
        date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
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
        bankBalance: 0
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
            initData();
        }
    }, [isOpen]);

    const initData = async () => {
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            const data = await writeChequeService.getInitData(companyCode);
            
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

    const handleCommit = async () => {
        if (!formData.bankAcc) return showErrorToast('Select settlement bank.');
        if (expenses.length === 0 && items.length === 0) return showErrorToast('Add at least one line item (Expense or Item).');
        
        const totalAmount = calculateTotal();
        if (totalAmount <= 0) return showErrorToast('Total amount must be greater than zero.');

        setLoading(true);
        try {
            // 1. Save Expenses
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

            // 2. Save Items
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

            // 3. Save Header
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

            // 4. Apply
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
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.bankAcc) return showErrorToast('Select settlement bank.');
        if (expenses.length === 0 && items.length === 0) return showErrorToast('Add at least one line item (Expense or Item).');
        
        const totalAmount = calculateTotal();
        if (totalAmount <= 0) return showErrorToast('Total amount must be greater than zero.');

        setLoading(true);
        try {
            // 1. Save Expenses
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

            // 2. Save Items
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

            // 3. Save Header
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
            endorsement: 'A/C PAYEE ONLY'
        }));
        initData();
    };

    const handleOpenSearch = async () => {
        setLoading(true);
        try {
            const { companyCode } = getSessionData();
            const docs = await writeChequeService.searchSaved(companyCode);
            setSavedDocs(docs || []);
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
            const { header, expenses: loadedExpenses, items: loadedItems } = await writeChequeService.loadSaved(docNo, companyCode);
            
            setFormData(prev => ({
                ...prev,
                docId: header.docNo,
                date: header.date,
                bankAcc: header.bankCode,
                payeeName: header.payee,
                payeeId: header.payeeId,
                address: header.address,
                chqNo: header.chequeNo,
                totalAmount: header.totalAmount
            }));

            // Map loaded expenses to the UI structure
            setExpenses((loadedExpenses || []).map(exp => ({
                accCode: exp.accCode,
                accName: exp.accName,
                amount: exp.amount,
                memo: exp.memo,
                costCenter: exp.costCenter
            })));

            // Map loaded items to the UI structure
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
            title="Write Cheque Portfolio"
            maxWidth="max-w-[1150px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                    <div className="flex gap-3">
                         <button onClick={() => setShowVoidConfirm(true)} className="px-6 h-10 bg-[#ff3b30] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Trash2 size={14} /> VOID 
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none shadow-md shadow-blue-100">
                            <RotateCcw size={14} /> CLEAR 
                        </button>
                        <button onClick={handleOpenSearch} className="px-6 h-10 bg-[#8b5cf6] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-purple-100 hover:bg-[#7c3aed] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Search size={14} /> SEARCH 
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSaveDraft} disabled={loading} className="px-6 h-10 bg-white text-[#0285fd] text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                             SAVE DRAFT
                        </button>
                        <button onClick={handleCommit} disabled={loading} className="px-8 h-10 bg-[#2bb744] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                             APPLY
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma'] select-none">
                <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                        {/* Row 1: Doc ID & Date */}
                        <div className="col-span-6 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Document ID</label>
                            <div className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-white flex items-center rounded transition-all focus-within:border-[#00D1FF] focus-within:ring-2 focus-within:ring-[#00D1FF]/20">
                                {formData.docId}
                            </div>
                        </div>

                        <div className="col-span-6 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Dispatch Date</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.date} 
                                    className="flex-1 px-3 text-[12px] border border-slate-200 rounded outline-none text-gray-700 font-mono font-bold bg-white text-center cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    onClick={() => openCalendar('date')}
                                />
                                <button onClick={() => openCalendar('date')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 hover:bg-[#0073ff]">
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Settlement Bank */}
                        <div className="col-span-12 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Settlement Bank</label>
                            <div className="flex-1 flex gap-1 items-center h-8">
                                <div className="flex-1 relative flex items-center h-full">
                                    <Landmark size={14} className="absolute left-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.banks.find(b => b.code === formData.bankAcc)?.name || ''} 
                                        className="w-full h-full border border-slate-200 pl-9 pr-3 text-[12px] font-bold text-slate-800 bg-white outline-none rounded truncate cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowBankModal(true)}
                                    />
                                </div>
                                <button onClick={() => setShowBankModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                                {formData.bankAcc && (
                                    <div className="px-3 h-8 bg-blue-50 flex flex-col justify-center rounded border border-blue-100 min-w-[120px] ml-1">
                                        <span className="text-[8px] font-black text-blue-400 uppercase leading-none">Bank Balance</span>
                                        <span className="text-[12px] font-mono font-black text-blue-700">{formData.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 3: Cost Center & Endorsement */}
                        <div className="col-span-6 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Cost Center</label>
                            <div className="flex-1 flex gap-1 items-center h-8">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.costCenters.find(cc => cc.costCenterCode === formData.costCenter)?.costCenterName || ''} 
                                    className="flex-1 min-w-0 h-full border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white outline-none rounded truncate cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    onClick={() => { setCcSource('header'); setShowCCModal(true); }}
                                />
                                <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-6 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Endorsement</label>
                            <div className="flex-1 flex gap-1 items-center h-8">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.endorsement} 
                                    className="flex-1 min-w-0 h-full border border-slate-200 px-3 text-[12px] font-bold bg-white text-gray-700 outline-none rounded shadow-sm cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    onClick={() => setShowEndorsementModal(true)}
                                />
                                <button onClick={() => setShowEndorsementModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Row 4: Pay to Order */}
                        <div className="col-span-12 flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Pay to order</label>
                            <div className="flex-1 flex gap-1 h-8">
                                <input type="text" className="w-24 h-full font-mono border border-slate-200 px-3 text-[12px] bg-slate-50 text-slate-600 font-bold rounded" value={formData.payeeId} readOnly />
                                <input type="text" className="flex-1 h-full font-bold border border-slate-200 px-3 text-[12px] text-slate-800 bg-white transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded" value={formData.payeeName} onChange={(e) => setFormData({...formData, payeeName: e.target.value})} />
                                <div className="flex h-full shadow-sm ml-1 gap-1">
                                    <button onClick={() => setShowPayeeModal(true)} title="Search Payees" className="w-10 h-full bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all active:scale-95">
                                        <Search size={14} />
                                    </button>
                                    <button onClick={() => setShowVendorModal(true)} title="Search Vendors" className="w-10 h-full bg-[#2bb744] text-white flex items-center justify-center hover:bg-[#259b3a] rounded transition-all active:scale-95">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Postal Address */}
                        <div className="col-span-12 flex items-start gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 mt-1.5">Postal Address</label>
                            <textarea className="flex-1 h-20 border border-slate-200 p-3 text-[12px] font-bold text-gray-700 resize-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded-[5px] bg-white font-mono" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                        </div>
                    </div>
                </div>

                {/* 2. Cheque Specifics & Financial Summary */}
                <div className="grid grid-cols-12 gap-x-6 items-stretch">
                    <div className="col-span-7 bg-white border border-slate-200 p-4 rounded-[5px] shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                             <div className="flex items-center gap-2.5">
                                <div className="h-3.5 w-1 bg-blue-500 rounded-full"></div>
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Bank Submission Details</span>
                             </div>
                             <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 border-slate-300 rounded text-[#00D1FF] focus:ring-[#00D1FF] transition-all" checked={formData.isElectronic} onChange={(e) => setFormData({...formData, isElectronic: e.target.checked})} />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight group-hover:text-[#00D1FF]">Electronic Pay</span>
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-y-3 items-center">
                            {/* Cheque No Section */}
                            <div className="col-span-12 xl:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase w-20 shrink-0">Cheque No</label>
                                <div className="flex-1 flex items-center gap-2 h-8 min-w-0">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00D1FF] shrink-0 focus:ring-[#00D1FF]" checked={formData.isChqNoManual} onChange={(e) => setFormData({...formData, isChqNoManual: e.target.checked})} />
                                    <input type="text" className="flex-1 min-w-0 h-full border border-slate-200 px-3 text-[13px] font-bold text-gray-800 tracking-wider transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded bg-white" value={formData.chqNo} onChange={(e) => setFormData({...formData, chqNo: e.target.value})} />
                                </div>
                            </div>

                            {/* Chq Date Section */}
                            <div className="col-span-12 xl:col-span-6 flex items-center gap-2 xl:pl-6">
                                <label className="text-[11px] font-black text-gray-400 uppercase w-20 shrink-0 xl:text-right">Chq Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.chqDate} 
                                        className="flex-1 min-w-0 px-3 text-[12px] border border-slate-200 rounded outline-none text-slate-700 font-bold bg-white text-center cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        onClick={() => openCalendar('chqDate')}
                                    />
                                    <button onClick={() => openCalendar('chqDate')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 hover:bg-[#0073ff]">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-5 bg-blue-50/20 p-4 rounded-[5px] border border-dashed border-blue-200 flex flex-col justify-center relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Receipt size={80} className="-rotate-12 text-blue-600" />
                         </div>
                         <div className="text-right z-10">
                            <label className="text-[10px] font-black text-blue-400 uppercase block mb-1 tracking-wider">Total Payable Disbursement</label>
                            <div className="text-[32px] font-black text-slate-900 tracking-tighter tabular-nums flex items-baseline justify-end gap-1 leading-none">
                                {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Expenses/Items Portfolio Ledger Table */}
                <div className="bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden flex flex-col min-h-[250px]">
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <div className="flex gap-1">
                            {[
                                { id: 'Expenses', icon: Receipt },
                                { id: 'Items', icon: Package }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-2 ${selectedTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <tab.icon size={12} />
                                    {tab.id}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Live Allocation Grid</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        {selectedTab === 'Expenses' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                        <th className="px-4 py-3 w-12 text-center">#</th>
                                        <th className="px-4 py-3 w-[35%]">Ledger Selection</th>
                                        <th className="px-4 py-3 w-[25%]">Allocation CC</th>
                                        <th className="px-4 py-3 w-40 text-right">Net Value</th>
                                        <th className="px-4 py-3">Memo / Internal Transcript</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.map((line, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2 text-center font-mono text-[11px] text-gray-300 font-bold group-hover:text-slate-400 transition-colors">{idx + 1}</td>
                                            <td className="px-2 py-1">
                                                <div className="flex gap-1 items-center h-8">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={lookups.accounts.find(a => a.code === line.accCode)?.name || ''} 
                                                        className="flex-1 min-w-0 h-full font-mono border border-transparent px-3 text-[11px] font-bold bg-transparent text-slate-700 rounded outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white cursor-pointer" 
                                                        onClick={() => { setAccIndex(idx); setShowAccModal(true); }}
                                                    />
                                                    <button onClick={() => { setAccIndex(idx); setShowAccModal(true); }} className="w-8 h-8 bg-white border border-slate-200 text-gray-400 flex items-center justify-center hover:text-[#00D1FF] hover:border-[#00D1FF] rounded transition-all active:scale-90 opacity-0 group-hover:opacity-100 shrink-0">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex gap-1 items-center h-8">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={lookups.costCenters.find(cc => cc.costCenterCode === line.costCenter)?.costCenterName || ''} 
                                                        className="flex-1 min-w-0 h-full font-mono border border-transparent px-3 text-[11px] font-bold bg-transparent text-gray-600 rounded outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white cursor-pointer" 
                                                        onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }}
                                                    />
                                                    <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-8 h-8 bg-white border border-slate-200 text-gray-400 flex items-center justify-center hover:text-[#00D1FF] hover:border-[#00D1FF] rounded transition-all active:scale-90 opacity-0 group-hover:opacity-100 shrink-0">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-1">
                                                <input type="text" className="w-full h-8 font-mono border border-transparent px-3 text-right text-[12px] font-black text-gray-800 bg-transparent rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white" value={line.amount} onChange={(e) => {
                                                    const newExp = [...expenses];
                                                    newExp[idx].amount = e.target.value;
                                                    setExpenses(newExp);
                                                }} />
                                            </td>
                                            <td className="px-2 py-1">
                                                <input type="text" className="w-full h-8 font-mono border border-transparent px-3 text-[11px] text-gray-500 bg-transparent rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white" value={line.memo} onChange={(e) => {
                                                    const newExp = [...expenses];
                                                    newExp[idx].memo = e.target.value;
                                                    setExpenses(newExp);
                                                }} />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50/30">
                                        <td colSpan="5" className="p-0 border-t border-slate-100">
                                            <button onClick={() => setExpenses([...expenses, { accCode: '', costCenter: '', amount: '0.00', memo: '' }])} className="w-full py-3 text-blue-600 font-black text-[10px] tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group border-none bg-transparent">
                                                <Plus size={14} /> ATTACH EXPENSE LINE
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                        <th className="px-4 py-3 w-12 text-center">#</th>
                                        <th className="px-4 py-3 w-[40%]">Item Description</th>
                                        <th className="px-4 py-3 w-24 text-center">Qty</th>
                                        <th className="px-4 py-3 w-32 text-right">Unit Cost</th>
                                        <th className="px-4 py-3 w-40 text-right">Sub Total</th>
                                        <th className="px-4 py-3">Memo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((line, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2 text-center font-mono text-[11px] text-gray-300 font-bold group-hover:text-slate-400 transition-colors">{idx + 1}</td>
                                            <td className="px-2 py-1">
                                                <div className="flex gap-1 items-center h-8">
                                                    <input 
                                                        type="text" 
                                                        readOnly 
                                                        value={lookups.products.find(p => p.code === line.itemCode)?.prod_Name || ''} 
                                                        className="flex-1 min-w-0 h-full font-mono border border-transparent px-3 text-[11px] font-bold bg-transparent text-slate-700 rounded outline-none truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white cursor-pointer" 
                                                        onClick={() => { setItemIndex(idx); setShowItemModal(true); }}
                                                    />
                                                    <button onClick={() => { setItemIndex(idx); setShowItemModal(true); }} className="w-8 h-8 bg-white border border-slate-200 text-gray-400 flex items-center justify-center hover:text-[#00D1FF] hover:border-[#00D1FF] rounded transition-all active:scale-90 opacity-0 group-hover:opacity-100 shrink-0">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-1">
                                                <input type="number" className="w-full h-8 font-mono border border-transparent px-2 text-center text-[11px] font-bold bg-transparent rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white" value={line.qty} onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].qty = e.target.value;
                                                    setItems(newItems);
                                                }} />
                                            </td>
                                            <td className="px-2 py-1">
                                                <input type="text" className="w-full h-8 font-mono border border-transparent px-2 text-right text-[11px] font-bold bg-transparent rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white" value={line.cost} onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].cost = e.target.value;
                                                    setItems(newItems);
                                                }} />
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono text-[12px] font-black text-slate-700">
                                                {( (parseFloat(line.cost) || 0) * (parseInt(line.qty) || 0) ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-2 py-1">
                                                <input type="text" className="w-full h-8 font-mono border border-transparent px-3 text-[11px] text-gray-500 bg-transparent rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 group-hover:border-slate-200 group-hover:bg-white" value={line.description} onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].description = e.target.value;
                                                    setItems(newItems);
                                                }} />
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50/30">
                                        <td colSpan="6" className="p-0 border-t border-slate-100">
                                            <button onClick={() => setItems([...items, { itemCode: '', description: '', qty: '1', cost: '0.00' }])} className="w-full py-3 text-blue-600 font-black text-[10px] tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group border-none bg-transparent">
                                                <Plus size={14} /> ATTACH ITEM LINE
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* 4. Global Validation Summary Footer */}
                <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-[5px] shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Accounting Delta</span>
                                 <div className="text-[18px] font-mono leading-none font-black text-slate-800 tracking-tighter">
                                    {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                 </div>
                             </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Entry Validated</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <button onClick={handleClear} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all active:scale-90 border-none bg-transparent">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {/* --- Lookups --- */}

        <SimpleModal
            isOpen={showBankModal}
            onClose={() => setShowBankModal(false)}
            title="Search Payment Origin Ledgers"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Find ledger account by name..." 
                        className="h-9 border-none bg-transparent text-sm w-full focus:outline-none" 
                        value={bankSearch} 
                        onChange={(e) => setBankSearch(e.target.value)} 
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Ledger Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map((b, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, bankAcc: b.code});
                                    fetchBankBalance(b.code);
                                    setShowBankModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{b.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{b.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] uppercase px-3 py-1.5 rounded-[5px] font-bold shadow-sm border-none">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showCCModal}
            onClose={() => setShowCCModal(false)}
            title="Search Portfolio Cost Centers"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Find cost center..." 
                        className="h-9 border-none bg-transparent text-sm w-full focus:outline-none" 
                        value={ccSearch} 
                        onChange={(e) => setCcSearch(e.target.value)} 
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Center Description</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.costCenters.filter(c => c.costCenterName.toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    if (ccSource === 'header') {
                                        setFormData({...formData, costCenter: c.costCenterCode});
                                    } else {
                                        const newExp = [...expenses];
                                        newExp[ccIndex].costCenter = c.costCenterCode;
                                        setExpenses(newExp);
                                    }
                                    setShowCCModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{c.costCenterCode}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{c.costCenterName}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showEndorsementModal}
            onClose={() => setShowEndorsementModal(false)}
            title="Select Crossing Type"
            maxWidth="max-w-md"
        >
            <div className="p-1 space-y-1 font-['Tahoma']">
                {lookups.endorsements.map((type, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => {
                            setFormData(prev => ({ ...prev, endorsement: type }));
                            setShowEndorsementModal(false);
                        }}
                        className="w-full text-left px-5 py-3.5 text-[13px] font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center justify-between group uppercase tracking-tight border-none bg-transparent"
                    >
                        {type}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-blue-400" />
                    </button>
                ))}
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showAccModal}
            onClose={() => setShowAccModal(false)}
            title="Search Ledger Accounts"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filter accounts by name or code..." 
                        className="h-9 border-none bg-transparent text-sm w-full focus:outline-none" 
                        value={accSearch} 
                        onChange={(e) => setAccSearch(e.target.value)} 
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Account Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.accounts.filter(a => a.name.toLowerCase().includes(accSearch.toLowerCase()) || a.code.includes(accSearch)).map((a, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    const newExp = [...expenses];
                                    newExp[accIndex].accCode = a.code;
                                    setExpenses(newExp);
                                    setShowAccModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{a.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{a.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black shadow-md border-none">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showItemModal}
            onClose={() => setShowItemModal(false)}
            title="Search Inventory Products"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filter products..." 
                        className="h-9 border-none bg-transparent text-sm w-full focus:outline-none" 
                        value={itemSearch} 
                        onChange={(e) => setItemSearch(e.target.value)} 
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Product Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.products.filter(p => p.prod_Name.toLowerCase().includes(itemSearch.toLowerCase()) || p.code.includes(itemSearch)).map((p, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    const newItems = [...items];
                                    newItems[itemIndex].itemCode = p.code;
                                    newItems[itemIndex].description = p.prod_Name;
                                    setItems(newItems);
                                    setShowItemModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{p.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{p.prod_Name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black shadow-md border-none">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showPayeeModal}
            onClose={() => setShowPayeeModal(false)}
            title="Search Historical Payees"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filter payees..." 
                        className="h-9 border-none bg-transparent text-sm w-full focus:outline-none" 
                        value={formData.payeeName}
                        onChange={(e) => setFormData({...formData, payeeName: e.target.value})} 
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Payee Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.customers.filter(c => c.name.toLowerCase().includes((formData.payeeName || '').toLowerCase())).map((c, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, payeeId: c.code, payeeName: c.name});
                                    setShowPayeeModal(false);
                                }}>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{c.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black shadow-md border-none">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showVendorModal}
            onClose={() => setShowVendorModal(false)}
            title="Select Supplier / Vendor"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Supplier Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.vendors.map((v, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, payeeId: v.id, payeeName: v.name, address: v.address});
                                    setShowVendorModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{v.id}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{v.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#2bb744] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#259b3a] shadow-md transition-all border-none">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            title="Search Saved Cheques"
            maxWidth="max-w-4xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by Document Number or Payee..."
                        value={docSearchQuery}
                        onChange={(e) => setDocSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-500 focus:outline-none transition-all text-[13px] bg-gray-50/50"
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Doc No</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Payee</th>
                                <th className="px-4 py-3">Bank Code</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {savedDocs.filter(d => 
                                (d.docNo?.toLowerCase() || '').includes(docSearchQuery.toLowerCase()) || 
                                (d.payee?.toLowerCase() || '').includes(docSearchQuery.toLowerCase())
                            ).map((d, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => handleLoadDoc(d.docNo)}>
                                    <td className="px-4 py-3 font-mono text-[12px] font-bold text-[#0285fd]">{d.docNo}</td>
                                    <td className="px-4 py-3 text-[12px] text-gray-500">{new Date(d.date).toLocaleDateString('en-GB')}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700">{d.payee}</td>
                                    <td className="px-4 py-3 text-[12px] text-gray-500">{d.bankCode}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-[13px]">
                                        {d.amount?.toLocaleString('en-US', {minimumFractionDigits:2})}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#2bb744] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#259b3a] shadow-md transition-all border-none">LOAD</button>
                                    </td>
                                </tr>
                            ))}
                            {savedDocs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400 text-sm">No saved documents found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
            onConfirm={() => {
                handleClear();
                setShowVoidConfirm(false);
                onClose();
                showSuccessToast('Document sequence cancelled and cleared.');
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
