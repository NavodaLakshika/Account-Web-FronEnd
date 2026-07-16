import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Calendar, ShieldCheck } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
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

const DirectBankTransactionBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], accounts: [], costCenters: [] });

    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        relevantDate: new Date().toISOString().split('T')[0],
        type: 'Expenses',
        bankAccount: '',
        bankAccountName: '',
        apAccount: '',
        apAccountName: '',
        costCenter: '',
        costCenterName: '',
        memo: '',
        amount: 0,
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');

    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSavedTx, setLastSavedTx] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            loadInitialData(companyCode);
        }
    }, [isOpen]);

    const loadInitialData = async (compCode) => {
        try {
            setLoading(true);
            const activeComp = compCode || formData.company;
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getDirectTransactionLookups(activeComp),
                bankingService.generateDocNo('MDPO', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.bankAccount || !formData.apAccount || formData.amount <= 0) {
            showErrorToast("Please fill in all required fields and ensure the amount is greater than zero.");
            return;
        }

        try {
            setLoading(true);

            const isExpense = formData.type === 'Expenses';
            const transactionAmount = isExpense ? -Math.abs(formData.amount) : Math.abs(formData.amount);

            const payload = {
                DocNo: formData.docNo,
                Company: formData.company,
                CreateUser: formData.createUser,
                DepositTo: formData.bankAccount,
                DepositDate: formData.date,
                Memo: formData.memo || `${formData.type} Transaction`,
                RefNo: formData.docNo,
                TotalAmount: transactionAmount,
                Entries: [
                    {
                        ReceivedFrom: formData.apAccountName || '',
                        AccountCode: formData.apAccount,
                        Memo: formData.memo || `${formData.type} Transaction`,
                        Amount: transactionAmount
                    }
                ]
            };

            await bankingService.saveDirectTransaction(payload);
            showSuccessToast('Direct transaction saved successfully!');

            setLastSavedTx({
                type: 'BANK DIRECT TRANSACTION',
                docNo: formData.docNo,
                payee: formData.apAccountName ? `${formData.apAccount} - ${formData.apAccountName}` : '',
                date: formData.date,
                total: formData.amount,
                details: {
                    header: {
                        docNo: formData.docNo,
                        date: formData.date,
                        payee: formData.apAccountName,
                        amount: formData.amount,
                    },
                    expenses: [{
                        accCode: formData.bankAccountName,
                        memo: formData.memo || `${formData.type} Transaction`,
                        amount: formData.amount
                    }]
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
            bankAccount: '',
            bankAccountName: '',
            apAccount: '',
            apAccountName: '',
            costCenter: '',
            costCenterName: '',
            memo: '',
            amount: 0,
            type: 'Expenses'
        });
        loadInitialData();
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Direct Bank" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Bank Transaction"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date}
                                        onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setDatePickerField('date'); setShowDatePicker(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Doc ID */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>

                            {/* Relevant Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Relevant Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.relevantDate}
                                        onClick={() => { setDatePickerField('relevantDate'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setDatePickerField('relevantDate'); setShowDatePicker(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Bank Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.bankAccountName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, bankAccount: item.code, bankAccountName: item.name });
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.banks || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Type Selection */}
                            <div className="col-span-4 flex items-end gap-6 pb-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Income' ? 'border-[#0285fd] bg-[#0285fd]/10' : 'border-gray-300'}`}>
                                        {formData.type === 'Income' && <div className="w-2 h-2 bg-[#0285fd] rounded-full" />}
                                    </div>
                                    <input type="radio" value="Income" checked={formData.type === 'Income'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="hidden" />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.type === 'Income' ? 'text-[#0285fd]' : 'text-gray-400'}`}>Income</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.type === 'Expenses' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                                        {formData.type === 'Expenses' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                    </div>
                                    <input type="radio" value="Expenses" checked={formData.type === 'Expenses'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="hidden" />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.type === 'Expenses' ? 'text-red-500' : 'text-gray-400'}`}>Expenses</span>
                                </label>
                            </div>

                            {/* A/P Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/P Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.apAccountName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.accounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, apAccount: item.code, apAccountName: item.name });
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.accounts || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cost Center */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <select
                                        value={formData.costCenterName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, costCenter: item.code, costCenterName: item.name });
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.costCenters || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Memo */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 italic" />
                            </div>

                            {/* Amount */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount *</label>
                                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Help Section */}
                    <div className="bg-white p-4 border-l-4 border-l-[#0285fd] rounded-[3px] flex items-start gap-4 border border-slate-200">
                        <ShieldCheck size={16} className="text-[#0285fd] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Protocol</h4>
                            <p className="text-[11px] text-gray-600">
                                Direct bank transactions bypassing the standard reconciliation flow. Use this for bank charges, interest, and direct withdrawals/deposits that don't originate from a customer or vendor receipt/payment.
                            </p>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'bank'}
                onClose={() => setActiveModal(null)}
                title="Select Bank Account"
                items={lookups.banks}
                onSelect={(item) => setFormData({ ...formData, bankAccount: item.code, bankAccountName: item.name })}
            />

            <SearchModal
                isOpen={activeModal === 'ap'}
                onClose={() => setActiveModal(null)}
                title="Select A/P Account"
                items={lookups.accounts}
                onSelect={(item) => setFormData({ ...formData, apAccount: item.code, apAccountName: item.name })}
            />

            <SearchModal
                isOpen={activeModal === 'costCenter'}
                onClose={() => setActiveModal(null)}
                title="Select Cost Center"
                items={lookups.costCenters}
                onSelect={(item) => setFormData({ ...formData, costCenter: item.code, costCenterName: item.name })}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData[datePickerField]}
                onDateSelect={(date) => setFormData({ ...formData, [datePickerField]: date })}
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

export default DirectBankTransactionBoard;
