import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';
import { Search, RotateCcw, Loader2, Calendar, ArrowRightCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';

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

const FundsTransferBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ banks: [], costCenters: [] });
    const [receiptData, setReceiptData] = useState(null);

    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        fromAccount: '',
        fromAccountName: '',
        fromBalance: 0,
        fromCostCenter: '',
        fromCostCenterName: '',
        toAccount: '',
        toAccountName: '',
        toBalance: 0,
        toCostCenter: '',
        toCostCenterName: '',
        amount: 0,
        reffNo: '',
        memo: '',
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

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
                bankingService.getTransferLookups(activeComp),
                bankingService.generateDocNo('FNTDN', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSelect = async (account, type) => {
        try {
            const { balance } = await bankingService.getAccountBalance(account.code, formData.company);
            if (type === 'from') {
                setFormData(prev => ({ ...prev, fromAccount: account.code, fromAccountName: account.name, fromBalance: balance }));
            } else {
                setFormData(prev => ({ ...prev, toAccount: account.code, toAccountName: account.name, toBalance: balance }));
            }
        } catch (error) {
            showErrorToast("Failed to fetch account balance");
        }
    };

    const handleSave = async () => {
        if (!formData.fromAccount || !formData.toAccount || formData.amount <= 0) {
            showErrorToast("Please select both accounts and enter a valid amount.");
            return;
        }
        if (formData.fromAccount === formData.toAccount) {
            showErrorToast("Source and destination accounts cannot be the same.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveTransfer(formData);

            setReceiptData({
                type: 'FUNDS TRANSFER',
                docNo: formData.docNo,
                payee: `Transfer to ${formData.toAccountName}`,
                date: formData.date,
                total: formData.amount,
                details: {
                    header: {
                        docNo: formData.docNo,
                        date: formData.date,
                        payee: `Transfer to ${formData.toAccountName}`,
                        amount: formData.amount,
                        memo: formData.memo || 'Funds Transfer',
                    },
                    expenses: [
                        { accCode: formData.fromAccountName, memo: 'Source Account', amount: formData.amount },
                        { accCode: formData.toAccountName, memo: 'Destination Account', amount: formData.amount }
                    ]
                }
            });

            showSuccessToast('Funds transferred successfully!');
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
            fromAccount: '', fromAccountName: '', fromBalance: 0,
            fromCostCenter: '', fromCostCenterName: '',
            toAccount: '', toAccountName: '', toBalance: 0,
            toCostCenter: '', toCostCenterName: '',
            amount: 0, reffNo: '', memo: ''
        });
        loadInitialData();
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Funds Transfer" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Funds Transfer"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightCircle size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date}
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref No</label>
                                <input type="text" value={formData.reffNo} onChange={e => setFormData({ ...formData, reffNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Transfer FROM / TO */}
                    <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                        <div className="col-span-6 bg-white p-4 border border-slate-200 rounded-[3px] space-y-3.5">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transfer From</h3>

                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Source Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.fromAccountName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => handleAccountSelect(item, 'from');
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
                                <div className="mt-2 flex items-center justify-between px-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Balance</span>
                                    <span className="text-[12px] font-black text-red-600">Rs. {formData.fromBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <select
                                        value={formData.fromCostCenterName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, fromCostCenter: item.code, fromCostCenterName: item.name });
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
                        </div>

                        <div className="col-span-6 bg-white p-4 border border-slate-200 rounded-[3px] space-y-3.5">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transfer To</h3>

                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Destination Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.toAccountName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => handleAccountSelect(item, 'to');
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
                                <div className="mt-2 flex items-center justify-between px-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Balance</span>
                                    <span className="text-[12px] font-black text-[#0285fd]">Rs. {formData.toBalance.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <select
                                        value={formData.toCostCenterName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, toCostCenter: item.code, toCostCenterName: item.name });
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
                        </div>
                    </div>

                    {/* Flow Indicator */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <div className="px-4 py-1 bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-gray-200 rounded-[3px]">
                            <ArrowRightCircle size={13} /> Fund Movement Flow
                        </div>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Amount & Memo */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Transfer Amount *</label>
                                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                            </div>
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo / Remarks</label>
                                <input type="text" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 italic" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'fromAcc'}
                onClose={() => setActiveModal(null)}
                title="Select Source Account"
                items={lookups.banks}
                onSelect={(item) => handleAccountSelect(item, 'from')}
            />

            <SearchModal
                isOpen={activeModal === 'toAcc'}
                onClose={() => setActiveModal(null)}
                title="Select Destination Account"
                items={lookups.banks}
                onSelect={(item) => handleAccountSelect(item, 'to')}
            />

            <SearchModal
                isOpen={activeModal === 'fromCC'}
                onClose={() => setActiveModal(null)}
                title="Select From Cost Center"
                items={lookups.costCenters}
                onSelect={(item) => setFormData({ ...formData, fromCostCenter: item.code, fromCostCenterName: item.name })}
            />

            <SearchModal
                isOpen={activeModal === 'toCC'}
                onClose={() => setActiveModal(null)}
                title="Select To Cost Center"
                items={lookups.costCenters}
                onSelect={(item) => setFormData({ ...formData, toCostCenter: item.code, toCostCenterName: item.name })}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.date}
                onDateSelect={(date) => setFormData({ ...formData, date })}
            />

            {receiptData && (
                <TransactionReceiptModal
                    isOpen={true}
                    onClose={() => {
                        setReceiptData(null);
                        onClose();
                    }}
                    selectedTx={receiptData}
                />
            )}
        </>
    );
};

export default FundsTransferBoard;
