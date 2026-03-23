import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, RefreshCw , X, Save, RotateCcw, Loader2} from 'lucide-react';
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

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Pay Bill"
            maxWidth="max-w-[95vw]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                        Pay Bill
                    </button>
                    <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-1.5 overflow-y-auto no-scrollbar font-['Inter']">
                {/* 1. Top Header Configuration */}
                <div className="bg-white p-2 border border-gray-200 rounded-sm shadow-sm space-y-2">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-2 items-center">
                        <div className="col-span-4 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Voucher No</label>
                             <div className="flex-1">
                                <input type="text" name="payDoc" value={formData.payDoc} readOnly className="w-full h-7 border border-[#0078d4]/30 px-2 text-[12px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm outline-none" />
                             </div>
                        </div>

                        <div className="col-span-6 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-16 shrink-0">Vender</label>
                             <div className="flex-1 flex gap-1 px-4">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.vendors.find(v => v.code === formData.vendorId)?.name || ''} 
                                    placeholder="Select Vendor..." 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none font-bold text-[#b91c1c] bg-gray-50" 
                                />
                                <button onClick={() => setShowVendorModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-2">
                             <label className="text-[12px] font-bold text-gray-700">Date</label>
                             <input type="date" name="payDate" value={formData.payDate} onChange={handleInput} className="w-[100px] h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-white text-gray-700" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Cost Center</label>
                             <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''} 
                                    placeholder="Select Cost Center..." 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] bg-gray-50 rounded-sm outline-none" 
                                />
                                <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-8 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0 text-right pr-2">Manual Vou. No</label>
                             <input type="text" name="voucherNo" value={formData.voucherNo} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                {/* 2. Main Bills Table */}
                <div className="border border-gray-300 rounded-sm bg-white shadow-sm flex flex-col min-h-[200px]">
                    <div className="flex bg-[#f8fafd] border-b border-gray-300 text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        <div className="w-10 py-1.5 px-3 border-r border-gray-300 flex items-center justify-center">
                            <input type="checkbox" onChange={handleSelectAll} checked={bills.length > 0 && bills.every(b => b.selected)} className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-[0.8] py-1.5 px-3 border-r border-gray-300">Date Due</div>
                        <div className="flex-[1.2] py-1.5 px-3 border-r border-gray-300">Doc No</div>
                        <div className="flex-[2] py-1.5 px-3 border-r border-gray-300">Amount Due</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Balance</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Discount</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Set Of Use</div>
                        <div className="flex-[1.2] py-1.5 px-3 text-right">Amt. To Pay</div>
                    </div>
                    
                    <div className="flex-1 bg-white overflow-y-auto max-h-[140px]">
                        {loading && <div className="p-4 text-center text-gray-500 font-bold text-[12px]">Loading Bills...</div>}
                        {!loading && bills.length === 0 && <div className="p-4 text-center text-gray-400 font-semibold text-[12px]">No open bills for this vendor.</div>}
                        
                        {bills.map((bill, idx) => (
                            <div key={idx} className={`flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 ${bill.selected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                                <div className="w-10 py-1.5 px-3 flex items-center justify-center border-r border-gray-100">
                                    <input type="checkbox" checked={bill.selected} onChange={(e) => handleRowUpdate(idx, 'selected', e.target.checked)} className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-[0.8] py-1.5 px-3 flex items-center border-r border-gray-100">{bill.date?.split('T')[0]}</div>
                                <div className="flex-[1.2] py-1.5 px-3 flex items-center border-r border-gray-100">{bill.docNo}</div>
                                <div className="flex-[2] py-1.5 px-3 flex items-center border-r border-gray-100">{parseFloat(bill.amount || 0).toFixed(2)}</div>
                                <div className="flex-[1] py-1.5 px-3 flex items-center justify-end font-bold text-[#b91c1c] border-r border-gray-100">{parseFloat(bill.balance || 0).toFixed(2)}</div>
                                <div className="flex-[1] py-1 px-1 border-r border-gray-100">
                                    <input type="text" disabled={!bill.selected} value={bill.discount || ''} onChange={(e) => handleRowUpdate(idx, 'discount', e.target.value)} className="w-full h-full border border-gray-200 px-1 text-right text-[11px] outline-none disabled:bg-gray-50 focus:border-blue-400" />
                                </div>
                                <div className="flex-[1] py-1 px-1 border-r border-gray-100">
                                    <input type="text" disabled={!bill.selected} value={bill.setOfUse || ''} onChange={(e) => handleRowUpdate(idx, 'setOfUse', e.target.value)} className="w-full h-full border border-gray-200 px-1 text-right text-[11px] outline-none disabled:bg-gray-50 focus:border-blue-400" />
                                </div>
                                <div className="flex-[1.2] py-1 px-1">
                                    <input type="text" disabled={!bill.selected} value={bill.toPay || ''} onChange={(e) => handleRowUpdate(idx, 'toPay', e.target.value)} className="w-full h-full border text-[#0078d4] font-bold border-[#0078d4]/30 bg-blue-50/30 px-2 text-right text-[11px] outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:border-transparent focus:border-[#0078d4]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Summary Stats Section */}
                <div className="bg-blue-50/30 border border-[#0078d4]/20 p-2 rounded-sm space-y-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-[13px] font-bold gap-2">
                        <div className="flex items-center gap-3">
                            <label className="text-gray-800">Total Outstanding Balance</label>
                            <input type="text" value={totals.balance.toFixed(2)} readOnly className="w-32 h-7 bg-white border border-gray-300 text-right px-2 text-[#b91c1c] font-black rounded-sm outline-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[13px] font-bold text-gray-800 w-16 shrink-0">Memo</label>
                        <input type="text" name="memo" value={formData.memo} onChange={handleInput} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] focus:border-blue-500 bg-white rounded-sm outline-none" />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                        <ActionButton label="Clear Selection" onClick={handleClearSelection} />
                        <ActionButton label="Recalculate Totals" />
                    </div>
                </div>

                {/* 4. Fine Grain Stats Grid */}
                <div className="bg-white border border-gray-200 p-2 rounded-sm">
                    <div className="grid grid-cols-12 gap-x-12 gap-y-2">
                        {/* Column 1 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Sum of Amount Due" value={totals.amountDue.toFixed(2)} />
                            <StatRow label="Sum of Discount Value" value={totals.discount.toFixed(2)} />
                        </div>
                        {/* Column 2 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Sum of Credit Setoff" value={totals.setOfUse.toFixed(2)} />
                            <StatRow label="Sum of Total Value" value={totals.toPay.toFixed(2)} emphasized />
                        </div>
                        {/* Column 3 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Payable Count" value={bills.filter(b => b.selected).length.toString()} isEmpty />
                        </div>
                    </div>
                </div>

                {/* 5. Payment Finalization */}
                <div className="bg-white p-2 border border-gray-200 rounded-sm space-y-1.5">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-1.5">
                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-28 shrink-0">Payment Method</label>
                             <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.payType || ''} 
                                    placeholder="Select..." 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#b91c1c] bg-gray-50 rounded-sm outline-none" 
                                />
                                <button onClick={() => setShowPayTypeModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-8 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0">Payment Account</label>
                             <div className="flex-1 flex gap-1">
                                 <input 
                                    type="text" 
                                    readOnly 
                                    value={availableAccounts.find(a => a.code === formData.accId)?.name ? `${formData.accId} - ${availableAccounts.find(a => a.code === formData.accId).name}` : ''} 
                                    placeholder="Select Account..." 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-semibold bg-gray-50 rounded-sm outline-none" 
                                 />
                                 <button onClick={() => setShowAccModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                 </button>
                             </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-28 shrink-0">Payment Date</label>
                             <input type="date" value={formData.payDate} readOnly className="flex-1 h-7 border border-gray-300 rounded-sm px-2 text-[12px] outline-none bg-gray-50 text-gray-700" />
                        </div>

                        <div className="col-span-8 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0">Payment Cost Center</label>
                             <div className="flex-1 flex gap-1 items-center">
                                 <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.costCenters.find(c => c.code === formData.payCostCenter)?.name || ''} 
                                    placeholder="Select Cost Center..." 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] bg-gray-50 rounded-sm outline-none" 
                                 />
                                 <button onClick={() => { setCcSource('payment'); setShowCCModal(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                 </button>
                             </div>
                        </div>

                        <div className="col-span-12 grid grid-cols-12 gap-x-4">
                             <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-28 shrink-0">Chque No</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input type="text" name="chqNo" value={formData.chqNo} onChange={handleInput} disabled={formData.payType !== 'Cheque'} className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none disabled:bg-gray-100 disabled:border-transparent focus:border-blue-500" />
                                </div>
                             </div>

                             <div className="col-span-8 flex items-center gap-x-6 invisible">
                                 {/* Invisible Spacer matching original layout structure */}
                             </div>

                             <div className="col-span-12 flex justify-center mt-1">
                                <div className="flex items-center gap-3 w-[350px]">
                                    <label className="text-[12px] font-bold text-gray-700 w-32 text-right">Payment Applied</label>
                                    <input type="text" value={totals.toPay.toFixed(2)} readOnly className="flex-1 h-7 bg-white border border-gray-300 px-2 text-[14px] text-right text-[#000080] font-bold rounded-sm outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {/* Vendor Search Modal */}
        {showVendorModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVendorModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Vendors</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search by name or code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                            <button onClick={() => setShowVendorModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2 font-['Inter']">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Vendor Name</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        handleInput({ target: { name: 'vendorId', value: v.code } });
                                        setShowVendorModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{v.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{v.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Cost Center Search Modal */}
        {showCCModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCCModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Cost Centers</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search by name or code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} />
                            <button onClick={() => setShowCCModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2 font-['Inter']">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Cost Center</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        const field = ccSource === 'header' ? 'costCenter' : 'payCostCenter';
                                        setFormData(prev => ({ ...prev, [field]: c.code }));
                                        setShowCCModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{c.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{c.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Payment Method Search Modal */}
        {showPayTypeModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPayTypeModal(false)} />
                <div className="relative w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Select Payment Method</h3>
                        <button onClick={() => setShowPayTypeModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                    </div>
                    <div className="p-2 space-y-1">
                        {['Cash', 'Cheque', 'Online', 'Petty Cash', 'Settlement'].map((type, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, payType: type, accId: '' }));
                                    setShowPayTypeModal(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors flex items-center justify-between group"
                            >
                                {type}
                                <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Payment Account Search Modal */}
        {showAccModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Payment Accounts ({formData.payType})</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={accSearch} onChange={(e) => setAccSearch(e.target.value)} />
                            <button onClick={() => setShowAccModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2 font-['Inter']">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Account Name</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableAccounts.filter(a => (a.name || '').toLowerCase().includes(accSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        setFormData(prev => ({ ...prev, accId: a.code }));
                                        setShowAccModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{a.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{a.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {availableAccounts.length === 0 && (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium">Please select a Payment Method first.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
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
        <label className="text-[12px] font-bold text-gray-700 whitespace-nowrap">{label}</label>
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
