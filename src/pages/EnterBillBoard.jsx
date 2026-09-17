import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Trash2, X, Save, RotateCcw, Loader2, FileText, Plus } from 'lucide-react';
import SupplierMasterBoard from '../components/modals/MasterSubModal/SupplierMasterBoard';
import CostCenterProfileBoard from './CostCenterProfileBoard';
import NewAccountBoard from './NewAccountBoard';
import { enterBillService } from '../services/enterBill.service';
import { desktopNotificationService } from '../services/desktopNotification.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const EnterBillBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [billType, setBillType] = useState('Bill');
    const [lookups, setLookups] = useState({ payAccounts: [], expAccounts: [], costCenters: [], vendors: [], items: [] });
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCostCenterModal, setShowCostCenterModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [showAPModal, setShowAPModal] = useState(false);
    const [apSearch, setApSearch] = useState('');
    const [showExpModal, setShowExpModal] = useState(false);
    const [expSearch, setExpSearch] = useState('');
    const [showItemModal, setShowItemModal] = useState(false);
    const [itemSearch, setItemSearch] = useState('');
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'line'
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [billSearchQuery, setBillSearchQuery] = useState('');
    const [billSearchResults, setBillSearchResults] = useState([]);

    const [showSupplierMaster, setShowSupplierMaster] = useState(false);
    const [showCostCenterMaster, setShowCostCenterMaster] = useState(false);
    const [showAccountMaster, setShowAccountMaster] = useState(false);

    const handleSupplierMasterClose = () => {
        setShowSupplierMaster(false);
        fetchLookups();
    };

    const handleCostCenterMasterClose = () => {
        setShowCostCenterMaster(false);
        fetchLookups();
    };

    const handleAccountMasterClose = () => {
        setShowAccountMaster(false);
        fetchLookups();
    };

    const getInitialFormData = () => {
        const { companyCode, userName } = getSessionData();
        return {
            docNo: '',
            vendorId: '',
            accId: '',
            terms: '',
            memo: '',
            billNo: '',
            refNo: '',
            postDate: new Date().toISOString().split('T')[0],
            billDueDate: new Date().toISOString().split('T')[0],
            costCenter: '',
            company: companyCode || '',
            createUser: userName || ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});

    const [expenses, setExpenses] = useState([]);

    // Line entry state
    const [currentLine, setCurrentLine] = useState({
        accCode: '',
        costCenter: '',
        amount: '',
        memo: ''
    });

    useEffect(() => {
        if (isOpen) {
            desktopNotificationService.requestPermission().catch(() => {});
            setFormData(getInitialFormData());

            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({ ...prev, company: companyCode, createUser: userName }));

            fetchLookups();
            generateDocNo(companyCode);
        }
    }, [isOpen]);

    useEffect(() => {
        if (showSearchModal) {
            handleSearchBills();
        }
    }, [showSearchModal, billSearchQuery]);

    const handleSearchBills = async () => {
        try {
            const results = await enterBillService.searchBills(billSearchQuery, formData.company);
            setBillSearchResults(results);
        } catch (error) {
            showErrorToast('Failed to search bills');
        }
    };

    const loadBill = async (docNo) => {
        setLoading(true);
        try {
            const data = await enterBillService.getBill(docNo, formData.company);
            setFormData(prev => ({
                ...prev,
                docNo: data.header.doc_No || data.header.docNo,
                vendorId: data.header.vendor_Id || data.header.vendorId || '',
                accId: data.header.acc_Id || data.header.accId || '',
                terms: data.header.terms || '',
                memo: data.header.memo || '',
                billNo: data.header.bill_No || data.header.billNo || data.header.inv_No || '',
                refNo: data.header.ref_No || data.header.refNo || data.header.reference || data.header.reffNo2 || '',
                postDate: (data.header.post_Date || data.header.postDate || '').split('T')[0],
                billDueDate: (data.header.bill_Due_Date || data.header.billDueDate || data.header.expected_Date || '').split('T')[0],
                costCenter: data.header.costCenter || '',
                company: prev.company
            }));
            const bType = data.header.bill_Type !== undefined ? data.header.bill_Type : (data.header.billType !== undefined ? data.header.billType : 'Bill');
            setBillType(bType === true || bType === 'Bill' ? 'Bill' : 'Credit');

            if (data.expenses) {
                setExpenses(data.expenses.map(e => ({
                    accCode: e.accCode || e.acc_Code || '',
                    costCenter: e.costCenter || '',
                    amount: e.amount || 0,
                    memo: e.memo || ''
                })));
            } else { setExpenses([]); }

            setShowSearchModal(false);
            showSuccessToast(`Bill ${docNo} loaded successfully`);
        } catch (error) {
            showErrorToast('Failed to load bill details');
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            const data = await enterBillService.getLookups();
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await enterBillService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleLineChange = (e) => {
        const { name, value } = e.target;
        setCurrentLine(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLine = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!currentLine.accCode || !currentLine.amount || parseFloat(currentLine.amount) === 0) {
                showErrorToast('Please select an account and enter a valid amount.');
                return;
            }
            setExpenses([...expenses, { ...currentLine, amount: parseFloat(currentLine.amount) }]);
            setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
            if (errors.expenses) setErrors(prev => ({ ...prev, expenses: null }));
        }
    };

    const handleRemoveLine = (idx) => {
        setExpenses(expenses.filter((_, i) => i !== idx));
    };

    const calculateTotal = () => {
        const expTotal = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        return expTotal.toFixed(2);
    };

    const handleClear = () => {
        setExpenses([]);
        setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
        setFormData({
            ...formData,
            vendorId: '',
            accId: '',
            terms: '',
            memo: '',
            billNo: '',
            refNo: '',
            costCenter: ''
        });
        setErrors({});
        setVendorSearch('');
        setCcSearch('');
        setApSearch('');
        setExpSearch('');
        setItemSearch('');
        setBillType('Bill');
        generateDocNo();
    };

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.docNo) newErrors.docNo = 'Document Number is required. Please reload if it failed to generate.';
        if (!formData.vendorId) newErrors.vendorId = 'Vendor is required.';
        if (!formData.accId) newErrors.accId = 'A/P Account (Payable) is required.';
        if (expenses.length === 0) newErrors.expenses = 'At least one expense line is required.';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showErrorToast('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await enterBillService.save({
                ...formData,
                billType: String(billType || 'Bill'),
                netAmount: parseFloat(calculateTotal()),
                expenses: expenses
            });
            showSuccessToast('Bill saved successfully!');

            // Find vendor name for desktop alert
            const currentVendor = (lookups.vendors || []).find(v => (v.code || v.itemId || v.id) === formData.vendorId);
            const vendorName = currentVendor ? (currentVendor.name || currentVendor.itemName || currentVendor.code) : formData.vendorId;

            // Trigger Google Chrome Desktop Notification for unpaid / payment pending bill
            desktopNotificationService.notifyUnpaidBill({
                docNo: formData.docNo,
                refNo: formData.refNo || formData.docNo,
                vendor: vendorName,
                amount: parseFloat(calculateTotal()),
                dueDate: formData.billDueDate
            });

            handleClear();
        } catch (error) {
            showErrorToast(error.message || 'Error saving bill');
        } finally {
            setLoading(false);
        }
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
            <TransactionFormWrapper boardName="EnterBillBoard" isOpen={isOpen}
                onClose={onClose}
                title="Enter Bill"

                icon={FileText}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE BILL
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
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Main Doc No <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-2">
                                    <div className="relative cursor-pointer" onClick={() => setShowSearchModal(true)}>
                                        <input
                                            type="text"
                                            name="docNo"
                                            value={formData.docNo}
                                            readOnly
                                            onClick={() => setShowSearchModal(true)}
                                            placeholder="Select Doc No..."
                                            className={`w-44 h-10 border ${errors.docNo ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 pr-8 text-[14px] font-semibold text-[#0285fd] bg-slate-50 hover:bg-blue-50/50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer truncate transition-all`}
                                        />
                                        <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowSearchModal(true)}
                                        className="h-10 px-3 bg-blue-50 text-[#0285fd] hover:bg-blue-100 hover:text-blue-700 border border-[#0285fd]/40 font-semibold rounded-[3px] flex items-center justify-center gap-1.5 transition-all text-[12px] shadow-sm active:scale-95 shrink-0"
                                        title="Search / Select Existing Bill Document"
                                    >
                                        <Search size={14} />
                                        <span>Select Doc</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleClear();
                                            showSuccessToast('New bill initialized');
                                        }}
                                        className="h-10 px-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-300 font-semibold rounded-[3px] flex items-center justify-center gap-1 transition-all text-[12px] shadow-sm active:scale-95 shrink-0"
                                        title="Create New Bill"
                                    >
                                        <Plus size={14} />
                                        <span>New</span>
                                    </button>
                                </div>
                                {errors.docNo && <div className="text-red-500 text-[11px] mt-1">{errors.docNo}</div>}
                            </div>

                            <div className="flex items-center bg-slate-100 p-1 rounded-[3px]">
                                <button
                                    onClick={() => setBillType('Bill')}
                                    className={`px-8 py-1 text-[11px] font-bold rounded-[3px] transition-all uppercase tracking-widest ${billType === 'Bill' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    BILL
                                </button>
                                <button
                                    onClick={() => setBillType('Credit')}
                                    className={`px-8 py-1 text-[11px] font-bold rounded-[3px] transition-all uppercase tracking-widest ${billType === 'Credit' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    CREDIT
                                </button>
                            </div>

                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.postDate}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        onClick={() => openCalendar('postDate')}
                                    />
                                    <button onClick={() => openCalendar('postDate')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Column Fields */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Name <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2 relative group">
                                        <select
                                            value={formData.vendorId || ''}
                                            onChange={(ev) => {
                                                const val = ev.target.value;
                                                const v = (lookups.vendors || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                if (v) {
                                                    setFormData(prev => ({ ...prev, vendorId: v.code }));
                                                    setErrors(prev => ({ ...prev, vendorId: null }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, vendorId: '' }));
                                                }
                                            }}
                                            className={`w-full h-10 border ${errors.vendorId ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none`}
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {(lookups.vendors || []).map((v, idx) => (
                                                <option key={idx} value={v.code || v.itemId || v.id || v.name || v}>
                                                    {v.code ? `${v.code} - ${v.name}` : (v.itemId ? `${v.itemId} - ${v.itemName || v.name}` : (v.name || v))}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowSupplierMaster(true)}
                                            className="h-10 w-10 flex-shrink-0 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[3px] flex items-center justify-center transition-colors relative"
                                            title="Create Vendor"
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                    {errors.vendorId && <div className="text-red-500 text-[11px] mt-1">{errors.vendorId}</div>}
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                    <div className="flex gap-2 relative group">
                                        <select
                                            value={formData.costCenter || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {(lookups.costCenters || []).map((c, idx) => (
                                                <option key={idx} value={c.code}>{c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowCostCenterMaster(true)}
                                            className="h-10 w-10 flex-shrink-0 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[3px] flex items-center justify-center transition-colors relative"
                                            title="Create Cost Center"
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bill Terms</label>
                                    <input name="terms" value={formData.terms} onChange={handleInputChange} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">General Memo</label>
                                    <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                            </div>

                            {/* Right Column Fields */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/P Account (GL) <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2 relative group">
                                        <select
                                            value={formData.accId || ''}
                                            onChange={(ev) => {
                                                const val = ev.target.value;
                                                const a = (lookups.payAccounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                if (a) {
                                                    setFormData(prev => ({ ...prev, accId: a.code }));
                                                    setErrors(prev => ({ ...prev, accId: null }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, accId: '' }));
                                                }
                                            }}
                                            className={`w-full h-10 border ${errors.accId ? 'border-red-500' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none`}
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="">Select...</option>
                                            {(lookups.payAccounts || []).map((a, idx) => (
                                                <option key={idx} value={a.code || a.itemId || a.id || a.name || a}>
                                                    {a.code ? `${a.code} - ${a.name}` : (a.itemId ? `${a.itemId} - ${a.itemName || a.name}` : (a.name || a))}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowAccountMaster(true)}
                                            className="h-10 w-10 flex-shrink-0 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[3px] flex items-center justify-center transition-colors relative"
                                            title="Create Account"
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                    {errors.accId && <div className="text-red-500 text-[11px] mt-1">{errors.accId}</div>}
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier Bill No</label>
                                    <input name="billNo" value={formData.billNo} onChange={handleInputChange} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Reference No</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="refNo"
                                            value={formData.refNo}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="Enter Ref No..."
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBillSearchQuery(formData.refNo || '');
                                                setShowSearchModal(true);
                                            }}
                                            className="h-10 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded-[3px] flex items-center justify-center gap-1 transition-colors text-[12px] shrink-0"
                                            title="Search by Reference / Doc No"
                                        >
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Due Date</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.billDueDate}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                            onClick={() => openCalendar('billDueDate')}
                                        />
                                        <button onClick={() => openCalendar('billDueDate')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Due Amount</label>
                                    <div className="w-full h-10 border border-red-200 bg-red-50/50 px-3 text-[14px] font-bold text-red-600 text-right flex items-center justify-end rounded-[3px]">
                                        {calculateTotal()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details Table Section */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4 items-center">
                                <button
                                    className="text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all border-blue-600 text-blue-600"
                                >
                                    Expenses <span className="text-red-500">*</span>
                                </button>
                                {errors.expenses && <span className="text-red-500 text-[11px] font-bold">{errors.expenses}</span>}
                            </div>
                        </div>

                        <div className={`border ${errors.expenses ? 'border-red-500' : 'border-gray-200'} rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[300px]`}>
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-4 w-[30%]">Expense Account / Category</th>
                                        <th className="px-4 w-[20%]">Cost Center</th>
                                        <th className="px-4 w-[15%] text-right">Amount</th>
                                        <th className="px-4 w-[30%]">Line Memo</th>
                                        <th className="px-2 w-[5%] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((exp, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2.5 px-4 font-mono text-blue-700 uppercase">{lookups.expAccounts.find(a => a.code === exp.accCode)?.name || exp.accCode}</td>
                                            <td className="py-2.5 px-4 font-mono text-gray-400">{lookups.costCenters.find(c => c.code === exp.costCenter)?.name || exp.costCenter || '---'}</td>
                                            <td className="py-2.5 px-4 text-right font-mono font-black text-red-600 bg-red-50/10 tracking-tighter">{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-2.5 px-4 italic text-gray-400 font-medium">{exp.memo || '---'}</td>
                                            <td className="py-2.5 px-2 text-center">
                                                <button onClick={() => handleRemoveLine(idx)} className="text-red-300 hover:text-red-500 bg-red-50 p-1.5 rounded-[3px] transition-all active:scale-95"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-300 font-black text-[11px] uppercase tracking-widest">No expense items added.</td>
                                        </tr>
                                    )}
                                    {/* Entry Input Row */}
                                    <tr className="bg-slate-50 border-t border-slate-200">
                                        <td className="p-2 relative">
                                            <select
                                                value={currentLine.accCode || ''}
                                                onChange={(ev) => {
                                                    const val = ev.target.value;
                                                    const a = (lookups.expAccounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                                    if (a) {
                                                        setCurrentLine(prev => ({ ...prev, accCode: a.code }));
                                                    }
                                                }}
                                                className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"
                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                            >
                                                <option value="">Select...</option>
                                                {(lookups.expAccounts || []).map((a, idx) => (
                                                    <option key={idx} value={a.code || a.itemId || a.id || a.name || a}>
                                                        {a.code ? `${a.code} - ${a.name}` : (a.itemId ? `${a.itemId} - ${a.itemName || a.name}` : (a.name || a))}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2 relative">
                                            <select
                                                value={currentLine.costCenter || ''}
                                                onChange={(e) => setCurrentLine(prev => ({ ...prev, costCenter: e.target.value }))}
                                                className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"
                                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                            >
                                                <option value="">Cost Center</option>
                                                {(lookups.costCenters || []).map((c, idx) => (
                                                    <option key={idx} value={c.code}>{c.code} - {c.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <input name="amount" value={currentLine.amount} onChange={handleLineChange} onKeyDown={handleAddLine} type="number" className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" placeholder="Amount" />
                                        </td>
                                        <td className="p-2">
                                            <input name="memo" value={currentLine.memo} onChange={handleLineChange} onKeyDown={handleAddLine} type="text" className="w-full h-8 border border-gray-300 rounded-[3px] px-2 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Memo" />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={handleAddLine} className="w-full h-8 bg-white border border-[#0285fd] text-[#0285fd] font-bold rounded-[3px] text-[9px] hover:bg-blue-50 transition-all flex items-center justify-center whitespace-nowrap gap-1">
                                                ADD
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Vendor Records - ${lookups.vendors.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Vendor Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, vendorId: v.code }));
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

            {/* Cost Center Search Modal Removed */}

            {/* A/P Account Search Modal */}
            <SimpleModal isOpen={showAPModal} onClose={() => setShowAPModal(false)} title={`GL Accounts Directory - ${lookups.payAccounts.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={apSearch}
                            onChange={(e) => setApSearch(e.target.value)}
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
                                {lookups.payAccounts.filter(a => (a.name || '').toLowerCase().includes(apSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(apSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, accId: a.code }));
                                                setShowAPModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title={`Expense Accounts - ${lookups.expAccounts.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={expSearch}
                            onChange={(e) => setExpSearch(e.target.value)}
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
                                {lookups.expAccounts.filter(a => (a.name || '').toLowerCase().includes(expSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(expSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setCurrentLine(prev => ({ ...prev, accCode: a.code }));
                                                setShowExpModal(false);
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
            <SimpleModal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={`Items - ${lookups.items?.length || 0} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Item Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(lookups.items || []).filter(i => (i.name || '').toLowerCase().includes(itemSearch.toLowerCase()) || (i.code || '').toLowerCase().includes(itemSearch.toLowerCase())).map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setCurrentItem(prev => ({ ...prev, itemId: item.code, description: item.name, cost: item.cost }));
                                                setShowItemModal(false);
                                            }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[calendarField]}
            />

            {/* Bill Search Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title={`Existing Bills & Documents - ${billSearchResults.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-3 bg-slate-50 p-4 border-b border-gray-200 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search Document</span>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm"
                                value={billSearchQuery}
                                onChange={(e) => setBillSearchQuery(e.target.value)}
                                placeholder="Search by Doc No, Reference No, Bill No, or Vendor..."
                            />
                            <Search size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                        {billSearchQuery && (
                            <button
                                onClick={() => setBillSearchQuery('')}
                                className="h-10 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-[3px] transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="max-h-[55vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-4 py-3">Doc No</th>
                                    <th className="border-b px-4 py-3">Ref No / Bill No</th>
                                    <th className="border-b px-4 py-3">Vendor</th>
                                    <th className="border-b px-4 py-3">Post Date</th>
                                    <th className="border-b text-right px-4 py-3">Amount Due</th>
                                    <th className="border-b text-center px-4 py-3">Status</th>
                                    <th className="border-b text-center w-24 px-4 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {billSearchResults.map((b, idx) => {
                                    const vName = lookups.vendors?.find(v => v.code === b.vendorId)?.name || b.vendorId || '-';
                                    const refDisplay = b.refNo || b.ref_No || b.reference || b.billNo || b.bill_No || '-';
                                    return (
                                        <tr key={idx} className="group hover:bg-blue-50/60 transition-all border-b border-gray-100 cursor-pointer">
                                            <td className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors px-4 py-3">
                                                {b.docNo}
                                            </td>
                                            <td className="font-mono text-[12px] font-semibold text-slate-600 px-4 py-3">
                                                {refDisplay}
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-4 py-3">
                                                {vName}
                                            </td>
                                            <td className="font-mono text-[12px] text-gray-500 px-4 py-3">
                                                {b.date ? b.date.split('T')[0] : '-'}
                                            </td>
                                            <td className="text-[12px] text-right font-bold text-red-600 px-4 py-3">
                                                Rs. {b.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-center px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="text-center px-4 py-3">
                                                <button
                                                    onClick={() => loadBill(b.docNo)}
                                                    className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-[#0285fd] hover:text-white text-[11px] px-4 py-1.5 rounded-[3px] font-bold shadow-sm transition-all active:scale-95 uppercase"
                                                >
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {billSearchResults.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            No bills found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>
            <SupplierMasterBoard isOpen={showSupplierMaster} onClose={handleSupplierMasterClose} />
            <CostCenterProfileBoard isOpen={showCostCenterMaster} onClose={handleCostCenterMasterClose} />
            <NewAccountBoard isOpen={showAccountMaster} onClose={handleAccountMasterClose} />
        </>
    );
};

export default EnterBillBoard;
