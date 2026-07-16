import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Plus, Calendar } from 'lucide-react';
import { paymentSetoffService } from '../services/paymentSetoff.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

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

const PaymentSetoffBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ suppliers: [] });

    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        supplierName: '',
        totalOutstanding: 0,
        totalReturns: 0,
        company: companyCode,
        createUser: userName
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [pendingPayments, setPendingPayments] = useState([]);
    const [returns, setReturns] = useState([]);
    const [selectedSetoffs, setSelectedSetoffs] = useState([]);
    const [selectedPendingRow, setSelectedPendingRow] = useState(null);
    const [selectedReturnRow, setSelectedReturnRow] = useState(null);
    const [setoffAmountInput, setoffAmountInputSet] = useState('');

    const [activeModal, setActiveModal] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSavedTx, setLastSavedTx] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [lookupRes, docRes] = await Promise.all([
                paymentSetoffService.getLookups(formData.company),
                paymentSetoffService.generateDocNo(companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierSelect = async (supplier) => {
        setFormData(prev => ({ ...prev, supplierId: supplier.code, supplierName: supplier.name }));
        setActiveModal(null);

        try {
            setLoading(true);
            const [pends, rets] = await Promise.all([
                paymentSetoffService.getPendingPayments(supplier.code, formData.company),
                paymentSetoffService.getReturns(supplier.code, formData.company)
            ]);
            setPendingPayments(pends);
            setReturns(rets);
            setFormData(prev => ({
                ...prev,
                totalOutstanding: pends.reduce((sum, p) => sum + (p.balanceAmount || 0), 0),
                totalReturns: rets.reduce((sum, r) => sum + (r.balanceAmount || 0), 0)
            }));
            setSelectedSetoffs([]);
        } catch (error) {
            showErrorToast("Failed to load supplier records");
        } finally {
            setLoading(false);
        }
    };

    const handleApplySetoff = async () => {
        if (!formData.supplierId || selectedSetoffs.length === 0) {
            showErrorToast("Please select a supplier and allocate set-offs.");
            return;
        }

        try {
            setLoading(true);
            await paymentSetoffService.apply({ ...formData, lines: selectedSetoffs });
            showSuccessToast('Payment setoff applied successfully!');

            const totalSetoff = selectedSetoffs.reduce((sum, s) => sum + s.setoffAmount, 0);
            setLastSavedTx({
                type: 'PAYMENT SET OFF',
                docNo: formData.docNo,
                payee: formData.supplierName ? `${formData.supplierId} - ${formData.supplierName}` : '',
                date: formData.date,
                total: totalSetoff,
                details: {
                    header: {
                        docNo: formData.docNo,
                        date: formData.date,
                        payee: formData.supplierName,
                        amount: totalSetoff,
                    },
                    expenses: selectedSetoffs.map(s => ({
                        accCode: `Offset: ${s.pendDoc}`,
                        memo: `Against Return: ${s.retDoc}`,
                        amount: s.setoffAmount
                    }))
                }
            });
            setShowReceipt(true);

            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            supplierId: '',
            supplierName: '',
            totalOutstanding: 0,
            totalReturns: 0
        });
        setPendingPayments([]);
        setReturns([]);
        setSelectedSetoffs([]);
        loadInitialData();
    };

    const handleAddAllocation = () => {
        if (!selectedPendingRow || !selectedReturnRow) {
            showErrorToast("Please select one pending payment and one return to offset.");
            return;
        }

        const amount = parseFloat(setoffAmountInput);
        if (isNaN(amount) || amount <= 0) {
            showErrorToast("Please enter a valid amount greater than 0.");
            return;
        }

        if (amount > selectedPendingRow.balanceAmount) {
            showErrorToast("Setoff amount cannot exceed the pending payment balance.");
            return;
        }

        if (amount > selectedReturnRow.balanceAmount) {
            showErrorToast("Setoff amount cannot exceed the return balance.");
            return;
        }

        const newSetoff = {
            id: Date.now(),
            pendDoc: selectedPendingRow.documentNo,
            pendDate: selectedPendingRow.date,
            pendBal: selectedPendingRow.balanceAmount,
            setoffAmount: amount,
            retDoc: selectedReturnRow.documentNo,
            retDate: selectedReturnRow.date,
            retAmount: amount,
            retBal: selectedReturnRow.balanceAmount
        };

        setPendingPayments(prev => prev.map(p => p.documentNo === selectedPendingRow.documentNo ? { ...p, balanceAmount: p.balanceAmount - amount } : p));
        setReturns(prev => prev.map(r => r.documentNo === selectedReturnRow.documentNo ? { ...r, balanceAmount: r.balanceAmount - amount } : r));

        setSelectedSetoffs([...selectedSetoffs, newSetoff]);
        setSelectedPendingRow(null);
        setSelectedReturnRow(null);
        setoffAmountInputSet('');
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Payment Setoff" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Payment Set Off"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleApplySetoff} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Apply Setoff
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier</label>
                                <div className="relative">
                                    <select
                                        value={formData.supplierName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.suppliers || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = handleSupplierSelect;
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.suppliers || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date}
                                        onClick={() => setShowCalendar(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowCalendar(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Payments & Returns */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6 bg-white border border-slate-200 rounded-[3px] flex flex-col">
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-slate-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Payments</span>
                            </div>
                            <div className="h-[180px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                        <tr>
                                            <th className="px-4">Document No</th>
                                            <th className="px-4">Date</th>
                                            <th className="px-4 text-right">Amount</th>
                                            <th className="px-4 text-right">Balance</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pendingPayments.map((p, i) => (
                                            <tr key={i} onClick={() => setSelectedPendingRow(p)}
                                                className={`transition-colors cursor-pointer text-[12px] ${selectedPendingRow?.documentNo === p.documentNo ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <td className="px-4 py-2 font-mono font-bold text-gray-700">{p.documentNo}</td>
                                                <td className="px-4 py-2 font-mono text-gray-500">{p.date}</td>
                                                <td className="px-4 py-2 text-right font-mono">{p.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-mono font-bold text-red-600">{p.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {pendingPayments.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 text-[11px]">No records found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[13px] font-medium text-gray-700">Total Outstanding:</span>
                                    <span className="text-[18px] font-black text-[#b91c1c] font-mono">{formData.totalOutstanding.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-6 bg-white border border-slate-200 rounded-[3px] flex flex-col">
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-slate-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Returns &amp; Advances</span>
                            </div>
                            <div className="h-[180px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                        <tr>
                                            <th className="px-4">Document No</th>
                                            <th className="px-4">Date</th>
                                            <th className="px-4 text-right">Amount</th>
                                            <th className="px-4 text-right">Balance</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {returns.map((r, i) => (
                                            <tr key={i} onClick={() => setSelectedReturnRow(r)}
                                                className={`transition-colors cursor-pointer text-[12px] ${selectedReturnRow?.documentNo === r.documentNo ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <td className="px-4 py-2 font-mono font-bold text-gray-700">{r.documentNo}</td>
                                                <td className="px-4 py-2 font-mono text-gray-500">{r.date || '---'}</td>
                                                <td className="px-4 py-2 text-right font-mono">{r.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-mono font-bold text-[#0285fd]">{r.balanceAmount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {returns.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-300 text-[11px]">No records found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[13px] font-medium text-gray-700">Total Returns &amp; Advance:</span>
                                    <span className="text-[18px] font-black text-[#0285fd] font-mono">{formData.totalReturns.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Setoff Action Bar */}
                    <div className="bg-white border border-slate-200 rounded-[3px] p-4 space-y-3">
                        <div className="grid grid-cols-12 gap-x-4 gap-y-3 items-end">
                            <div className="col-span-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Selected Pending</label>
                                <div className="w-full h-10 border border-gray-300 rounded-[3px] px-3 flex items-center text-[13px] font-bold text-gray-700 bg-white truncate">
                                    {selectedPendingRow ? selectedPendingRow.documentNo : '-- Select --'}
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Selected Return</label>
                                <div className="w-full h-10 border border-gray-300 rounded-[3px] px-3 flex items-center text-[13px] font-bold text-gray-700 bg-white truncate">
                                    {selectedReturnRow ? selectedReturnRow.documentNo : '-- Select --'}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount</label>
                                <input type="number"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right"
                                    value={setoffAmountInput}
                                    onChange={(e) => setoffAmountInputSet(e.target.value)}
                                    placeholder="0.00" />
                            </div>
                            <div className="col-span-2">
                                <button onClick={handleAddAllocation}
                                    className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] text-[12px] shadow-sm transition-all flex items-center justify-center gap-2 border-none">
                                    <Plus size={15} /> Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Selected Allocation Table */}
                    <div className="bg-white border border-slate-200 rounded-[3px] flex flex-col overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-gray-200 bg-slate-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Allocation</span>
                        </div>
                        <div className="min-h-[150px] max-h-[200px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-3">Selected Doc</th>
                                        <th className="px-3">Date</th>
                                        <th className="px-3 text-right">Balance Amt</th>
                                        <th className="px-3 text-right">Set-Off Amt</th>
                                        <th className="px-3">Set-Off Document</th>
                                        <th className="px-3">Date</th>
                                        <th className="px-3 text-right">Line Total</th>
                                        <th className="px-3 text-right">Rem. Balance</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedSetoffs.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 text-[11px]">
                                            <td className="px-3 py-2 font-mono font-bold text-gray-700">{s.pendDoc}</td>
                                            <td className="px-3 py-2 font-mono text-gray-500">{s.pendDate}</td>
                                            <td className="px-3 py-2 text-right font-mono font-bold">{s.pendBal.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-blue-600">{s.setoffAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 font-mono font-bold text-gray-700">{s.retDoc}</td>
                                            <td className="px-3 py-2 font-mono text-gray-500">{s.retDate}</td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-[#0285fd]">{s.retAmount.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-red-600">{(s.pendBal - s.setoffAmount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {selectedSetoffs.length === 0 && (
                                        <tr><td colSpan={8} className="p-12 text-center text-gray-300 text-[11px] uppercase tracking-widest">Select pending invoices and matching return documents to build your set-off schedule.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'supplier'}
                onClose={() => setActiveModal(null)}
                title="Select Supplier"
                items={lookups.suppliers}
                onSelect={handleSupplierSelect}
            />

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => { setFormData(prev => ({ ...prev, date })); setShowCalendar(false); }}
                initialDate={formData.date}
            />

            {showReceipt && lastSavedTx && (
                <TransactionReceiptModal
                    selectedTx={lastSavedTx}
                    onClose={() => {
                        setShowReceipt(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default PaymentSetoffBoard;
