import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, RefreshCw, X, Save, RotateCcw, Loader2, CreditCard, Trash2 } from 'lucide-react';
import { payBillService } from '../services/payBill.service';
import { toast } from 'react-hot-toast';

const PayBillBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ 
        costCenters: [], vendors: [], cashAccounts: [], chqAccounts: [], creditAccounts: [], settlementAccounts: [] 
    });

    const [formData, setFormData] = useState({
        payDoc: '',
        vendorId: '',
        company: '',
        accId: '',
        payDate: new Date().toISOString().split('T')[0],
        payType: '',
        chqNo: '',
        createUser: 'SYSTEM',
        voucherNo: '',
        memo: '',
        payAmount: 0,
        costCenter: '',
        payCostCenter: ''
    });

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCCModal, setShowCCModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'payment'
    const [showPayTypeModal, setShowPayTypeModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [accSearch, setAccSearch] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            generateDocNo();
            
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';
            
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }
            
            setFormData(prev => ({ 
                ...prev, 
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM' 
            }));
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await payBillService.getLookups();
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async () => {
        try {
            const data = await payBillService.generateDocNo();
            setFormData(prev => ({ ...prev, payDoc: data.docNo }));
        } catch (error) {
            toast.error('Failed to generate document number.');
        }
    };

    // Load available accounts based on Payment Method Dropdown
    const availableAccounts = useMemo(() => {
        switch (formData.payType) {
            case 'Cash': return lookups.cashAccounts;
            case 'Cheque': 
            case 'Online': return lookups.chqAccounts;
            case 'Petty Cash': return lookups.creditAccounts;
            case 'Settlement': return lookups.settlementAccounts;
            default: return [];
        }
    }, [formData.payType, lookups]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'vendorId' && value) {
            loadVendorBills(value);
        }
    };

    const loadVendorBills = async (vendorId) => {
        try {
            setLoading(true);
            const data = await payBillService.getVendorBills(vendorId, formData.company || 'C001');
            const enhancedData = data.map(b => ({
                ...b, selected: false, toPay: b.balance, discount: 0, setOfUse: 0
            }));
            setBills(enhancedData);
        } catch (error) {
            toast.error('Failed to load bills.');
        } finally {
            setLoading(false);
        }
    };

    const handleRowUpdate = (idx, field, value) => {
        const updated = [...bills];
        if (field === 'selected') {
            updated[idx].selected = value;
        } else {
            updated[idx][field] = value; // Store as raw string to allow typing decimals
            
            // Still enforce cap logic if it's cleanly readable as a number
            if (field === 'toPay') {
                const parsedNum = parseFloat(value);
                const maxBalance = parseFloat(updated[idx].balance) || 0;
                if (!isNaN(parsedNum) && parsedNum > maxBalance) {
                    updated[idx].toPay = maxBalance.toString();
                }
            }
        }
        setBills(updated);
    };

    const handleSelectAll = () => {
        const allSelected = bills.every(b => b.selected);
        setBills(bills.map(b => ({ ...b, selected: !allSelected })));
    };

    const handleClearSelection = () => {
        setBills(bills.map(b => ({ ...b, selected: false, toPay: b.balance, discount: 0, setOfUse: 0 })));
    };

    // Computations
    const totals = useMemo(() => {
        const selected = bills.filter(b => b.selected);
        return {
            amountDue: selected.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
            discount: selected.reduce((sum, b) => sum + (parseFloat(b.discount) || 0), 0),
            setOfUse: selected.reduce((sum, b) => sum + (parseFloat(b.setOfUse) || 0), 0),
            toPay: selected.reduce((sum, b) => sum + (parseFloat(b.toPay) || 0), 0),
            balance: selected.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0)
        };
    }, [bills]);

    const handleClear = () => {
        setVendorSearch('');
        setCcSearch('');
        setAccSearch('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.vendorId) return toast.error('Select Vendor Name.');
        if (!formData.payType) return toast.error('Select Payment Method.');
        if (!formData.accId) return toast.error('Select an Account.');
        if (!formData.memo) return toast.error('Memo not found.');

        const selectedBills = bills.filter(b => b.selected);
        if (selectedBills.length === 0 || totals.toPay <= 0) {
           return toast.error('No valid bills selected to pay.');
        }

        setLoading(true);
        const payload = {
            payDoc: formData.payDoc,
            vendorId: formData.vendorId,
            company: formData.company,
            accId: formData.accId,
            payDate: formData.payDate,
            payType: formData.payType,
            chqNo: formData.chqNo,
            createUser: formData.createUser,
            voucherNo: formData.voucherNo,
            memo: formData.memo,
            payAmount: totals.toPay,
            costCenter: formData.costCenter,
            payCostCenter: formData.payCostCenter,
            bills: selectedBills.map(b => ({
                docNo: b.docNo,
                discount: parseFloat(b.discount) || 0,
                toPay: parseFloat(b.toPay) || 0,
                setOfUse: parseFloat(b.setOfUse) || 0,
                costCenter: b.costCenter
            }))
        };

        try {
            await payBillService.save(payload);
            toast.success('Payment Applied Successfully.');
            handleClear();
        } catch (error) {
            toast.error(error.toString());
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
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Pay Supplier Bills"
            maxWidth="max-w-[950px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                        PAY BILL
                    </button>
                    <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                        <RotateCcw size={14} /> CLEAR FORM
                    </button>
                </div>
            }
        >
            <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma'] select-none px-1">
                {/* 1. Header Detail Configuration Section */}
                <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
                        <div className="flex items-center gap-3">
                             <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Doc Number</label>
                             <div className="flex items-center">
                                <input type="text" name="payDoc" value={formData.payDoc} readOnly className="w-32 h-8 font-mono border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none text-center shadow-inner" />
                             </div>
                        </div>

                        <div className="flex items-center gap-3">
                             <label className="text-[12.5px] font-bold text-gray-700">Transaction Date</label>
                             <div className="flex h-8 gap-1">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.payDate} 
                                    className="w-[110px] px-2 text-[12px] border border-gray-300 rounded-[5px] outline-none text-gray-700 font-mono font-bold bg-gray-50 text-center shadow-sm" 
                                />
                                <button onClick={() => openCalendar('payDate')} className="w-9 h-8 bg-white border border-gray-300 text-blue-600 flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                    <Calendar size={14} />
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-x-10 gap-y-4">
                        <div className="col-span-12 flex items-center gap-4">
                             <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Vendor Name</label>
                             <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.vendors.find(v => v.code === formData.vendorId)?.name || ''} 
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none font-bold text-blue-700 bg-gray-50 shadow-sm truncate" 
                                />
                                <button onClick={() => setShowVendorModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                    <Search size={16} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-6 flex items-center gap-4 text-center">
                             <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                             <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''} 
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] bg-gray-50 rounded-[5px] font-bold text-gray-600 outline-none truncate shadow-sm" 
                                />
                                <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-10 h-8 bg-white border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                    <Search size={16} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-6 flex items-center gap-4">
                             <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0 px-4">Manual Vou.</label>
                             <input type="text" name="voucherNo" value={formData.voucherNo} onChange={handleInput} className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] rounded-[5px] outline-none focus:border-blue-400 bg-white shadow-sm transition-all text-gray-800" />
                        </div>
                    </div>
                </div>

                {/* 2. Main Bills Table - Refined Distributions */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[250px]">
                    <div className="flex bg-[#f8fafc] border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10">
                        <div className="w-12 px-4 border-r border-gray-100 flex items-center justify-center">
                            <input type="checkbox" onChange={handleSelectAll} checked={bills.length > 0 && bills.every(b => b.selected)} className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </div>
                        <div className="flex-[0.8] px-4 border-r border-gray-100">Date Due</div>
                        <div className="flex-[1.2] px-4 border-r border-gray-100">Doc No</div>
                        <div className="flex-[1.5] px-4 border-r border-gray-100">Amount Due</div>
                        <div className="flex-[1] px-4 border-r border-gray-100">Balance</div>
                        <div className="flex-[1] px-4 border-r border-gray-100">Discount</div>
                        <div className="flex-[1] px-4 border-r border-gray-100">Set Of Use</div>
                        <div className="flex-[1.2] px-4 text-right">Amt. To Pay</div>
                    </div>
                    
                    <div className="flex-1 bg-white overflow-y-auto max-h-[250px] custom-scrollbar">
                        {loading && <div className="p-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest animate-pulse">Fetching Vendor Ledgers...</div>}
                        {!loading && bills.length === 0 && <div className="p-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No outstanding bills found.</div>}
                        
                        {bills.map((bill, idx) => (
                            <div key={idx} className={`flex border-b border-gray-50 text-[12px] font-bold text-gray-700 transition-colors ${bill.selected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                                <div className="w-12 px-4 flex items-center justify-center border-r border-gray-50">
                                    <input type="checkbox" checked={bill.selected} onChange={(e) => handleRowUpdate(idx, 'selected', e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </div>
                                <div className="flex-[0.8] px-4 flex items-center border-r border-gray-50 font-mono text-gray-500">{bill.date?.split('T')[0]}</div>
                                <div className="flex-[1.2] px-4 flex items-center border-r border-gray-50 font-mono text-blue-700 uppercase">{bill.docNo}</div>
                                <div className="flex-[1.5] px-4 flex items-center border-r border-gray-50 font-mono text-gray-700">{parseFloat(bill.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                <div className="flex-[1] px-4 flex items-center justify-end font-mono font-black text-red-600 bg-red-50/10 border-r border-gray-50">{parseFloat(bill.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                <div className="flex-[1] p-1 border-r border-gray-50">
                                    <input type="text" disabled={!bill.selected} value={bill.discount || ''} onChange={(e) => handleRowUpdate(idx, 'discount', e.target.value)} className="w-full h-8 font-mono border border-gray-200 px-2 text-right text-[11px] outline-none rounded-[5px] bg-white focus:border-blue-400 disabled:bg-gray-50/50 shadow-inner" />
                                </div>
                                <div className="flex-[1] p-1 border-r border-gray-50">
                                    <input type="text" disabled={!bill.selected} value={bill.setOfUse || ''} onChange={(e) => handleRowUpdate(idx, 'setOfUse', e.target.value)} className="w-full h-8 font-mono border border-gray-200 px-2 text-right text-[11px] outline-none rounded-[5px] bg-white focus:border-blue-400 disabled:bg-gray-50/50 shadow-inner" />
                                </div>
                                <div className="flex-[1.2] p-1">
                                    <input type="text" disabled={!bill.selected} value={bill.toPay || ''} onChange={(e) => handleRowUpdate(idx, 'toPay', e.target.value)} className="w-full h-8 font-mono text-blue-700 font-bold border border-blue-200/50 bg-blue-50/30 px-2 text-right text-[12px] outline-none rounded-[5px] focus:border-blue-400 disabled:bg-transparent shadow-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Global Totals & Payment Summary Section */}
                <div className="grid grid-cols-12 gap-x-10 items-start">
                    <div className="col-span-8 bg-white border border-gray-100 p-3 rounded-xl shadow-sm space-y-3">
                        <div className="flex items-center gap-4">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Outstanding</label>
                            <div className="flex-1 h-8 font-mono border border-red-100 bg-red-50/50 px-4 text-[15px] font-black text-red-600 text-right flex items-center justify-end rounded-[5px] shadow-inner">
                                {totals.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">General Memo</label>
                            <input type="text" name="memo" value={formData.memo} onChange={handleInput} className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] rounded-[5px] outline-none focus:border-blue-400 bg-white shadow-sm transition-all text-gray-800" />
                        </div>

                        <div className="flex items-center gap-3 pt-0.5">
                            <button onClick={handleClearSelection} className="px-5 h-7 bg-white border border-gray-300 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-gray-50 shadow-sm transition-all active:scale-95 leading-none">Reset Selection</button>
                            <div className="h-4 w-[1px] bg-gray-200"></div>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2"><CreditCard size={11} /> {bills.filter(b => b.selected).length} Active Invoices Selected</span>
                        </div>
                    </div>

                    <div className="col-span-4 space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                        <StatRow label="Gross Amount" value={totals.amountDue.toLocaleString(undefined, {minimumFractionDigits: 2})} />
                        <StatRow label="Trade Discount" value={totals.discount.toLocaleString(undefined, {minimumFractionDigits: 2})} />
                        <StatRow label="Credit Setoffs" value={totals.setOfUse.toLocaleString(undefined, {minimumFractionDigits: 2})} />
                        <div className="pt-1.5 border-t border-slate-200 mt-1">
                             <StatRow label="NET TO PAY" value={totals.toPay.toLocaleString(undefined, {minimumFractionDigits: 2})} emphasized />
                        </div>
                    </div>
                </div>

                {/* 5. Payment Finalization Execution Section */}
                <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-sm mb-2">
                    <div className="grid grid-cols-12 gap-x-10 gap-y-3">
                        <div className="col-span-12">
                             <div className="flex items-center gap-3 mb-1">
                                 <div className="h-4 w-1.5 bg-blue-600 rounded-full"></div>
                                 <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">Financial Settlement Details</h4>
                             </div>
                        </div>

                        <div className="col-span-12 grid grid-cols-12 gap-x-10">
                            <div className="col-span-5 space-y-2">
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Settlement Ledger</label>
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.payType || ''} 
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] font-black text-blue-700 bg-gray-50 rounded-[5px] outline-none shadow-sm" 
                                        />
                                        <button onClick={() => setShowPayTypeModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Cheque Ref No</label>
                                    <input type="text" name="chqNo" value={formData.chqNo} onChange={handleInput} disabled={formData.payType !== 'Cheque'} className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] font-bold rounded-[5px] outline-none bg-white focus:border-blue-400 shadow-sm disabled:bg-gray-50 disabled:border-transparent transition-all" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Settlement Date</label>
                                    <input type="text" value={formData.payDate} readOnly className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] font-bold bg-gray-50 rounded-[5px] outline-none shadow-sm text-center text-gray-600" />
                                </div>
                            </div>

                            <div className="col-span-7 space-y-2">
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Payment Option</label>
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={availableAccounts.find(a => a.code === formData.accId)?.name ? `${formData.accId} - ${availableAccounts.find(a => a.code === formData.accId).name}` : ''} 
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[11px] font-bold bg-gray-50 rounded-[5px] outline-none truncate shadow-sm text-gray-600" 
                                        />
                                        <button onClick={() => setShowAccModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Voucher No</label>
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.costCenters.find(c => c.code === formData.payCostCenter)?.name || ''} 
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] bg-gray-50 rounded-[5px] font-bold text-gray-600 outline-none truncate shadow-sm" 
                                        />
                                        <button onClick={() => { setCcSource('payment'); setShowCCModal(true); }} className="w-10 h-8 bg-white border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-0.5">
                                    <div className="flex items-center gap-4 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                                        <label className="text-[12px] font-black text-blue-800 w-32 shrink-0 uppercase tracking-tighter">Funds Applied</label>
                                        <div className="flex-1 h-8 font-mono bg-white border border-blue-200 px-3 text-[18px] font-black text-blue-700 text-right flex items-center justify-end rounded-[5px] shadow-sm">
                                            {totals.toPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>

        <CalendarModal 
            isOpen={showCalendar} 
            onClose={() => setShowCalendar(false)} 
            onDateSelect={handleDateSelect}
            initialDate={formData[calendarField]}
        />

        {/* Vendor Search Modal */}
        <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Search Vendors - ${lookups.vendors.length} Found`} maxWidth="max-w-xl">
             <div className="flex flex-col h-full font-['Tahoma']">
                <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Find vendor by name or ID" 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={vendorSearch} 
                        onChange={(e) => setVendorSearch(e.target.value)} 
                    />
                </div>
                <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                            <tr>
                                <th className="px-3 border-b">Code</th>
                                <th className="px-3 border-b">Vendor Name</th>
                                <th className="px-3 border-b text-center w-24">Select</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                    <td className="p-3 font-mono font-bold text-gray-700">{v.code}</td>
                                    <td className="p-3 font-mono uppercase text-blue-800">{v.name}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => {
                                            handleInput({ target: { name: 'vendorId', value: v.code } });
                                            setShowVendorModal(false);
                                        }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        {/* Cost Center Search Modal */}
        <SimpleModal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={`Search Cost Centers - ${lookups.costCenters.length} Found`} maxWidth="max-w-xl">
             <div className="flex flex-col h-full font-['Tahoma']">
                <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Find cost center" 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={ccSearch} 
                        onChange={(e) => setCcSearch(e.target.value)} 
                    />
                </div>
                <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                            <tr>
                                <th className="px-3 border-b">Code</th>
                                <th className="px-3 border-b">Center Description</th>
                                <th className="px-3 border-b text-center w-24">Select</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                    <td className="p-3 font-mono font-bold text-gray-700">{c.code}</td>
                                    <td className="p-3 font-mono uppercase text-gray-700">{c.name}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => {
                                            const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                            setFormData(prev => ({ ...prev, [field]: c.code }));
                                            setShowCCModal(false);
                                        }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        {/* Payment Method Search Modal */}
        <SimpleModal isOpen={showPayTypeModal} onClose={() => setShowPayTypeModal(false)} title="Select Settlement Mode" maxWidth="max-w-md">
            <div className="p-4 font-['Tahoma'] space-y-2">
                <div className="grid grid-cols-1 gap-2">
                    {['Cash', 'Cheque', 'Online', 'Petty Cash', 'Settlement'].map((type, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => {
                                setFormData(prev => ({ ...prev, payType: type, accId: '' }));
                                setShowPayTypeModal(false);
                            }}
                            className="w-full h-12 flex items-center justify-between px-6 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all group font-bold text-gray-700"
                        >
                            <span className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{idx + 1}</span>
                                {type}
                            </span>
                            <ChevronDown size={16} className="-rotate-90 text-gray-300 group-hover:text-blue-400 transition-all" />
                        </button>
                    ))}
                </div>
            </div>
        </SimpleModal>

        {/* Payment Account Search Modal */}
        <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Origin Accounts (${formData.payType})`} maxWidth="max-w-xl">
             <div className="flex flex-col h-full font-['Tahoma']">
                <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Search Available Ledgers</span>
                    <input 
                        type="text" 
                        placeholder="Filter accounts" 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={accSearch} 
                        onChange={(e) => setAccSearch(e.target.value)} 
                    />
                </div>
                <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                            <tr>
                                <th className="px-3 border-b">Code</th>
                                <th className="px-3 border-b">Account Descriptor</th>
                                <th className="px-3 border-b text-center w-24">Select</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {availableAccounts.filter(a => (a.name || '').toLowerCase().includes(accSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearch.toLowerCase())).map((a, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                    <td className="p-3 font-mono font-bold text-gray-700">{a.code}</td>
                                    <td className="p-3 font-mono uppercase text-gray-700">{a.name}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => {
                                            setFormData(prev => ({ ...prev, accId: a.code }));
                                            setShowAccModal(false);
                                        }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
        </>
    );
};

const ActionButton = ({ label, onClick }) => (
    <button onClick={onClick} className="px-5 h-7 bg-white border border-gray-400 text-gray-700 text-[12px] font-bold rounded-sm hover:bg-gray-50 hover:border-gray-600 shadow-sm transition-all active:translate-y-0.5">
        {label}
    </button>
);

const StatRow = ({ label, value, isEmpty, emphasized }) => (
    <div className="flex items-center justify-between gap-4">
        <label className="text-[12.5px] font-bold text-gray-700 whitespace-nowrap">{label}</label>
        <input 
            type="text" 
            value={value}
            readOnly
            className={`
                w-32 h-6 border border-gray-200 px-2 text-[11px] text-right outline-none rounded-sm bg-gray-50/30
                ${emphasized ? 'font-black text-black border-[#0078d4]/50 bg-blue-50/50 shadow-sm text-[12px]' : 'font-semibold text-gray-600'}
                ${isEmpty ? 'bg-white border-gray-300' : ''}
            `} 
        />
    </div>
);

export default PayBillBoard;
