import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, Save, RotateCcw, Loader2, Trash2, Plus } from 'lucide-react';
import { mainCashService } from '../services/mainCash.service';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';

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

const MainCashBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ mainAccounts: [], expenseAccounts: [], costCenters: [], payees: [] });

    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        accountName: '',
        costCenterId: '',
        costCenterName: '',
        payeeId: '',
        payeeName: '',
        address: '',
        memo: '',
        endingBal: 0,
        refNo: '',
        amount: 0,
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [rows, setRows] = useState([{ id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);

    const [activeModal, setActiveModal] = useState(null);
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

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
                mainCashService.getLookups(activeComp),
                mainCashService.generateDocNo(activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);

        if (field === 'amount') {
            const total = newRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
            setFormData(prev => ({ ...prev, amount: total }));
        }
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);
    };

    const deleteRow = (idx) => {
        if (rows.length === 1) return;
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows);
        const total = newRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        setFormData(prev => ({ ...prev, amount: total }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accountId: '',
            accountName: '',
            costCenterId: '',
            costCenterName: '',
            payeeId: '',
            payeeName: '',
            address: '',
            memo: '',
            endingBal: 0,
            refNo: '',
            amount: 0
        });
        setRows([{ id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);
        loadInitialData();
    };

    const handleSave = async () => {
        if (!formData.accountId || formData.amount <= 0) {
            showErrorToast("Please select an account and enter expense amounts.");
            return;
        }

        try {
            setLoading(true);
            const resp = await mainCashService.save({ ...formData, items: rows });
            showSuccessToast('Main Cash entry saved successfully!');

            setReceiptData({
                type: 'MAIN CASH ENTRY',
                total: parseFloat(formData.amount) || 0,
                docNo: resp.orgDocNo || formData.docNo,
                date: formData.date,
                payee: formData.payeeName || 'Cash',
                details: {
                    header: {
                        payType: 'Cash',
                        memo: formData.memo,
                        costCenter: formData.costCenterName,
                        bank: formData.accountName
                    },
                    expenses: rows.map(r => ({
                        accCode: `${r.expAccCode} - ${r.expAccName}`,
                        amount: parseFloat(r.amount) || 0,
                        memo: r.memo,
                        costCenter: r.ccCode
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

    return (
        <>
            <TransactionFormWrapper subtitle="Main Cash" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Main Cash Entry"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Side */}
                            <div className="col-span-7 space-y-3.5">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                    <input type="text" value={formData.docNo} readOnly
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account</label>
                                    <div className="relative">
                                        <select
                                        value={formData.accountId || ''}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.mainAccounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData(prev => ({ ...prev, accountId: item.code, accountName: item.name }));
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.mainAccounts || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                    <div className="relative">
                                        <select
                                        value={formData.costCenterId || ''}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData(prev => ({ ...prev, costCenterId: item.code, costCenterName: item.name }));
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

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay to the Order</label>
                                    <div className="relative">
                                        <select
                                        value={formData.payeeId || ''}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.payees || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => setFormData(prev => ({ ...prev, payeeId: item.code, payeeName: item.name, address: item.address || '' }));
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.payees || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="col-span-5 space-y-3.5">
                                <div>
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

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ending Bal</label>
                                    <div className="w-full h-10 flex items-center justify-end px-3 bg-gray-50 text-[13px] font-black text-gray-800 rounded-[3px] border border-gray-200">
                                        Rs. {formData.endingBal.toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>

                                <div className="pt-4">
                                    <div className="bg-slate-50 border border-gray-200 rounded-[3px] p-5 flex flex-col items-center justify-center h-[130px]">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount</span>
                                        <div className="text-[26px] font-black text-[#b91c1c] tracking-tighter leading-none">
                                            Rs. {parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address & Memo */}
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-7">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange}
                                    className="w-full h-[68px] border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none" />
                            </div>
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo</label>
                                <textarea name="memo" value={formData.memo} onChange={handleInputChange}
                                    className="w-full h-[68px] border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none italic" />
                            </div>
                        </div>
                    </div>

                    {/* Expense Grid */}
                    <div className="bg-white border border-slate-200 rounded-[3px] flex flex-col min-h-[250px] overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-slate-50">
                            <div className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Expenses
                            </div>
                        </div>

                        <div className="flex-1 bg-white overflow-hidden flex flex-col">
                            <div className="flex bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                <div className="w-10 text-center">#</div>
                                <div className="flex-[2] px-4">Expense Account</div>
                                <div className="flex-[1.5] px-4">Cost Center</div>
                                <div className="w-32 px-4 text-right">Amount</div>
                                <div className="flex-[2] px-4">Memo</div>
                                <div className="w-12 text-center">Action</div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[220px] divide-y divide-gray-50">
                                {rows.map((row, idx) => (
                                    <div key={idx} className="flex items-center hover:bg-blue-50/30 transition-colors">
                                        <div className="w-10 py-2.5 text-center text-[11px] font-bold text-gray-400">{idx + 1}</div>
                                        <div className="flex-[2] px-2 py-1.5">
                                            <div className="relative">
                                                <select
                                        value={row.expAccCode || ''}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.expenseAccounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => {
                    const newRows = [...rows];
                    newRows[activeRowIdx].expAccCode = item.code;
                    newRows[activeRowIdx].expAccName = item.name;
                    setRows(newRows);
                };
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.expenseAccounts || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                            </div>
                                        </div>
                                        <div className="flex-[1.5] px-2 py-1.5">
                                            <div className="relative">
                                                <select
                                        value={row.ccCode}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = (item) => {
                    const newRows = [...rows];
                    newRows[activeRowIdx].ccCode = item.code;
                    setRows(newRows);
                };
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
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
                                        <div className="w-32 px-2 py-1.5">
                                            <input type="number" step="0.01" value={row.amount}
                                                onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[13px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                        </div>
                                        <div className="flex-[2] px-2 py-1.5">
                                            <input type="text" value={row.memo}
                                                onChange={(e) => handleRowChange(idx, 'memo', e.target.value)}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[13px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 italic" />
                                        </div>
                                        <div className="w-12 flex justify-center">
                                            <button onClick={() => deleteRow(idx)}
                                                className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 border-t border-gray-200 bg-white">
                                <button onClick={addRow}
                                    className="h-8 px-5 bg-[#0285fd] hover:bg-[#0073ff] text-white rounded-[3px] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 shadow-sm transition-all border-none">
                                    <Plus size={13} /> Add Spend Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="Select Account"
                items={lookups.mainAccounts}
                onSelect={(item) => setFormData(prev => ({ ...prev, accountId: item.code, accountName: item.name }))}
            />

            <SearchModal
                isOpen={activeModal === 'cc'}
                onClose={() => setActiveModal(null)}
                title="Select Cost Center"
                items={lookups.costCenters}
                onSelect={(item) => setFormData(prev => ({ ...prev, costCenterId: item.code, costCenterName: item.name }))}
            />

            <SearchModal
                isOpen={activeModal === 'payee'}
                onClose={() => setActiveModal(null)}
                title="Select Payee"
                items={lookups.payees}
                onSelect={(item) => setFormData(prev => ({ ...prev, payeeId: item.code, payeeName: item.name, address: item.address || '' }))}
            />

            <SearchModal
                isOpen={activeModal === 'row_acc'}
                onClose={() => setActiveModal(null)}
                title="Select Expense Account"
                items={lookups.expenseAccounts}
                onSelect={(item) => {
                    const newRows = [...rows];
                    newRows[activeRowIdx].expAccCode = item.code;
                    newRows[activeRowIdx].expAccName = item.name;
                    setRows(newRows);
                }}
            />

            <SearchModal
                isOpen={activeModal === 'row_cc'}
                onClose={() => setActiveModal(null)}
                title="Select Cost Center (Row)"
                items={lookups.costCenters}
                onSelect={(item) => {
                    const newRows = [...rows];
                    newRows[activeRowIdx].ccCode = item.code;
                    setRows(newRows);
                }}
            />

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.date}
                onDateSelect={(date) => setFormData({ ...formData, date: date })}
            />

            {showReceipt && receiptData && (
                <TransactionReceiptModal
                    selectedTx={receiptData}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </>
    );
};

export default MainCashBoard;
