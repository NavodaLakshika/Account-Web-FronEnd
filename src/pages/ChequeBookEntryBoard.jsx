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

const ChequeBookEntryBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [] });

    const getInitialFormData = () => ({
        accountCode: '',
        accountName: '',
        bookNo: '1',
        entryDate: new Date().toISOString().split('T')[0],
        startNo: '',
        endNo: '',
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
            const res = await bankingService.getChequeBookLookups(compCode || formData.company);
            setLookups(res);
        } catch (error) {
            showErrorToast("Failed to load bank account parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.accountCode) return showErrorToast("Please select a valid Bank Account.");
        if (!formData.startNo || !formData.endNo) return showErrorToast("Start and End cheque numbers are required.");

        const start = parseInt(formData.startNo);
        const end = parseInt(formData.endNo);
        if (isNaN(start) || isNaN(end) || start > end) return showErrorToast("Invalid cheque range protocol.");

        if (end - start > 1000000) {
            setLoading(false);
            return showErrorToast("You are attempting to register over 1 Million cheques! Please check your serial numbers and try a smaller range.");
        }

        try {
            setLoading(true);
            await bankingService.saveChequeBook(formData);
            showSuccessToast('New Cheque Book registered successfully!');
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
            accountCode: '',
            accountName: '',
            bookNo: '1',
            entryDate: new Date().toISOString().split('T')[0],
            startNo: '',
            endNo: ''
        });
    };

    const totalCheques = (formData.startNo && formData.endNo) ?
        Math.max(0, parseInt(formData.endNo) - parseInt(formData.startNo) + 1) : 0;

    return (
        <>
            <TransactionFormWrapper subtitle="Cheque Book" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Book Entry"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Register Protocol
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Target Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target Account</label>
                                <div className="relative">
                                    <select
                                        value={formData.accountName}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.accounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = async (item) => {
                    setFormData({ ...formData, accountCode: item.code, accountName: item.name });
                    try {
                        const res = await bankingService.getChequeBookLookups(formData.company, item.code);
                        setFormData(prev => ({ ...prev, bookNo: res.nextBookNo.toString() }));
                    } catch (e) { }
                };
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

                            {/* Book No */}
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Book No</label>
                                <input type="text" value={formData.bookNo} onChange={e => setFormData({ ...formData, bookNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                            </div>

                            {/* Entry Date */}
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Entry Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.entryDate}
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Serial Number Range */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cheque Leaf Serial Protocol</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Start Serial</label>
                                <input type="text" value={formData.startNo} onChange={e => setFormData({ ...formData, startNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold tracking-wider" />
                            </div>
                            <div className="col-span-2 flex items-center justify-center pt-6">
                                <div className="w-8 h-px bg-gray-300" />
                            </div>
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">End Serial</label>
                                <input type="text" value={formData.endNo} onChange={e => setFormData({ ...formData, endNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold tracking-wider" />
                            </div>
                        </div>
                    </div>

                    {/* Leaflet Count */}
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-gray-200 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-600 uppercase">Leaves detected in sequence:</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-[#0285fd] tabular-nums">{totalCheques}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leaflets</span>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="Select Bank Account"
                items={lookups.accounts}
                onSelect={async (item) => {
                    setFormData({ ...formData, accountCode: item.code, accountName: item.name });
                    try {
                        const res = await bankingService.getChequeBookLookups(formData.company, item.code);
                        setFormData(prev => ({ ...prev, bookNo: res.nextBookNo.toString() }));
                    } catch (e) { }
                }}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.entryDate}
                onDateSelect={(date) => setFormData({ ...formData, entryDate: date })}
            />
        </>
    );
};

export default ChequeBookEntryBoard;
