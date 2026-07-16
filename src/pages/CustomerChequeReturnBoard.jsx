import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Loader2, Calendar } from 'lucide-react';
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

const CustomerChequeReturnBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ customers: [], banks: [] });

    const getInitialFormData = () => ({
        docNo: '',
        returnDate: new Date().toISOString().split('T')[0],
        customerCode: '',
        customerName: '',
        chequeNo: '',
        receiptNo: '',
        bankCode: '',
        bankName: '',
        chequeDate: new Date().toISOString().split('T')[0],
        chequeAmount: 0,
        extraCharges: 0,
        remarks: '',
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
                bankingService.getCustomerChequeLookups(activeComp),
                bankingService.generateDocNo('CHR', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial search data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!formData.chequeNo && !formData.receiptNo) {
            showErrorToast("Please enter a Cheque No or Receipt No to fetch record.");
            return;
        }

        try {
            setLoading(true);
            const cheque = await bankingService.findCustomerCheque({
                chequeNo: formData.chequeNo,
                receiptNo: formData.receiptNo,
                company: formData.company
            });

            if (cheque) {
                setFormData(prev => ({
                    ...prev,
                    customerCode: cheque.customerCode,
                    customerName: cheque.customerName || 'N/A',
                    chequeDate: cheque.chequeDate,
                    chequeAmount: cheque.chequeAmount,
                    bankCode: cheque.bankCode,
                    bankName: cheque.bankName,
                    receiptNo: cheque.receiptNo,
                    chequeNo: cheque.chequeNo
                }));
                showSuccessToast("Cheque link details retrieved!");
            } else {
                showErrorToast("No pending or realized customer cheque found for these details.");
            }
        } catch (error) {
            showErrorToast("Search protocol failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.customerCode || !formData.chequeNo || formData.chequeAmount <= 0) {
            showErrorToast("Please verify and search for a valid cheque record first.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeReturn(formData);
            showSuccessToast('Customer cheque return processed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            customerCode: '',
            customerName: '',
            chequeNo: '',
            receiptNo: '',
            bankCode: '',
            bankName: '',
            chequeDate: new Date().toISOString().split('T')[0],
            chequeAmount: 0,
            extraCharges: 0,
            remarks: ''
        });
        loadInitialData();
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Customer Cheque Return" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Cheque Return"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Return Instrument
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Doc No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>

                            {/* Return Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Return Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.returnDate}
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cheque Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.chequeDate}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none text-gray-700 truncate" />
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                                <div className="relative">
                                    <select
                                        value={formData.customerName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const item = (lookups.customers || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, customerCode: item.code, customerName: item.name });
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.customers || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cheque Amount */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Amount</label>
                                <div className="w-full h-10 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800">Rs. {formData.chequeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                <div className="relative">
                                    <input type="text" value={formData.chequeNo} onChange={e => setFormData({ ...formData, chequeNo: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>

                            {/* Receipt No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Receipt No</label>
                                <input type="text" value={formData.receiptNo} onChange={e => setFormData({ ...formData, receiptNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                            </div>

                            {/* Bank Account */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.bankName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const item = (lookups.banks || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData({ ...formData, bankCode: item.code, bankName: item.name });
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

                            {/* Extra Charges */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Extra Charges</label>
                                <input type="number" step="0.01" value={formData.extraCharges} onChange={e => setFormData({ ...formData, extraCharges: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                            </div>

                            {/* Remarks */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Remarks / Reason</label>
                                <input type="text" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 italic"
                                    placeholder="Enter remarks..." />
                            </div>
                        </div>
                    </div>

                    {/* Warning Section */}
                    <div className="bg-red-50 p-4 border-l-4 border-l-[#dc2626] rounded-[3px] flex items-start gap-4 border border-red-100">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">Operational Financial Warning</h4>
                            <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                                Processing a customer cheque return will automatically revert the linked receipt valuation and update the customer ledger balance. Extra charges entered above will be debited to the customer's account as an administrative fee.
                            </p>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'customer'}
                onClose={() => setActiveModal(null)}
                title="Select Customer"
                items={lookups.customers}
                onSelect={(item) => setFormData({ ...formData, customerCode: item.code, customerName: item.name })}
            />

            <SearchModal
                isOpen={activeModal === 'bank'}
                onClose={() => setActiveModal(null)}
                title="Select Bank Account"
                items={lookups.banks}
                onSelect={(item) => setFormData({ ...formData, bankCode: item.code, bankName: item.name })}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.returnDate}
                onDateSelect={(date) => setFormData({ ...formData, returnDate: date })}
            />
        </>
    );
};

export default CustomerChequeReturnBoard;
