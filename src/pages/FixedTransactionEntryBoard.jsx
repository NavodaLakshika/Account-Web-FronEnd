import React, { useState, useEffect } from 'react';
import CalendarModal from '../components/CalendarModal';
import { RotateCcw, Save, Calendar, ArrowRightLeft } from 'lucide-react';
import { fixedIncomeService } from '../services/fixedIncome.service';
import { fixedExpensesService } from '../services/fixedExpenses.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { getCompanyCode } from '../utils/session';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const FixedTransactionEntryBoard = ({ isOpen, onClose }) => {
    const [transactionType, setTransactionType] = useState('income'); // 'income' or 'expense'

    const initialState = {
        AccCode: '', AccountName: '', PartyName: '', 
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date().toISOString().split('T')[0],
        PayType: '', Amount: '', Company: '', CreateUser: '', Description: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [lookups, setLookups] = useState([]);
    const [payTypes, setPayTypes] = useState([]);
    const [transactionList, setTransactionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (typeof setErrors === "function") setErrors({});
            fetchData();
        }
    }, [isOpen, transactionType]);

    const fetchData = async () => {
        const company = getCompanyCode() || '';
        try {
            if (transactionType === 'income') {
                const [lookupData, listData] = await Promise.all([
                    fixedIncomeService.getLookups(),
                    fixedIncomeService.getList(company).catch(() => [])
                ]);
                processLookups(lookupData, ['4', '7']);
                setTransactionList(listData || []);
            } else {
                const [lookupData, listData] = await Promise.all([
                    fixedExpensesService.getLookups(),
                    fixedExpensesService.getList(company).catch(() => [])
                ]);
                processLookups(lookupData, ['6', '8', '5']);
                setTransactionList(listData || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showErrorToast('Failed to load data.');
        }
    };

    const processLookups = (data, validPrefixes) => {
        const rawAccounts = data?.accounts || (Array.isArray(data) ? data : []);
        const filteredAccounts = rawAccounts
            .filter(acc => {
                const code = String(acc.code || acc.sub_Code || '').trim();
                return validPrefixes.some(prefix => code.startsWith(prefix));
            })
            .map(acc => ({
                code: String(acc.code || acc.sub_Code || '').trim(),
                name: String(acc.name || acc.sub_Acc_Name || '').trim()
            }))
            .filter(acc => acc.code && acc.name)
            .sort((a, b) => {
                const numA = parseInt(a.code, 10);
                const numB = parseInt(b.code, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.code.localeCompare(b.code);
            });
        
        setLookups(filteredAccounts);
        setPayTypes(data?.payTypes || []);
    };

    const handleTypeChange = (type) => {
        setTransactionType(type);
        setFormData({ ...initialState, StartDate: formData.StartDate, EndDate: formData.EndDate });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleClear = () => {
        setFormData({ ...initialState, StartDate: formData.StartDate, EndDate: formData.EndDate });
        setErrors({});
    };

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.AccCode) newErrors.AccCode = 'Account type is required';
        if (!formData.PartyName) newErrors.PartyName = `${transactionType === 'income' ? 'Buyer' : 'Vendor'} name is required`;
        if (!formData.Amount || isNaN(formData.Amount)) newErrors.Amount = 'Valid amount is required';
        if (!formData.PayType) newErrors.PayType = 'Pay type is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showErrorToast('Please fill all required fields correctly.');
            return;
        }

        setLoading(true);
        const user = JSON.parse(sessionStorage.getItem('user'));
        const company = getCompanyCode() || '';
        const CreateUser = user?.emp_Name || user?.empName || '';

        try {
            if (transactionType === 'income') {
                await fixedIncomeService.save({
                    AccCode: formData.AccCode,
                    IncomeAccount: formData.AccountName,
                    Buyer: formData.PartyName,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    CreditDate: formData.StartDate,
                    PayType: formData.PayType,
                    Amount: formData.Amount,
                    Description: formData.Description,
                    Company: company,
                    CreateUser: CreateUser
                });
            } else {
                await fixedExpensesService.save({
                    AccCode: formData.AccCode,
                    ExpenseAccount: formData.AccountName,
                    Vendor: formData.PartyName,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    DebitDate: formData.StartDate,
                    PayType: formData.PayType,
                    Amount: formData.Amount,
                    Description: formData.Description,
                    Company: company,
                    CreateUser: CreateUser
                });
            }
            
            showSuccessToast(`${transactionType === 'income' ? 'Fixed Income' : 'Fixed Expense'} added successfully`);
            handleClear();
            fetchData();
        } catch (error) { showErrorToast(error.message || 'Failed to save record'); } finally { setLoading(false); }
    };

    const isIncome = transactionType === 'income';

    return (
        <>
            <TransactionFormWrapper boardName="FixedTransactionEntryBoard" icon={null}
                isOpen={isOpen} onClose={onClose} title="Fixed Income & Expenses Entry"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 h-10 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isIncome ? 'bg-[#0285fd] hover:bg-[#0073ff]' : 'bg-[#ff3b30] hover:bg-[#e0352b]'}`}>
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Toggle Switch */}
                    <div className="flex bg-slate-100 p-1 rounded-[5px] w-full shadow-inner border border-slate-200">
                        <button
                            onClick={() => handleTypeChange('income')}
                            className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-widest rounded-[3px] transition-all flex items-center justify-center gap-2 ${isIncome ? 'bg-white text-[#0078d4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ArrowRightLeft size={14} className={isIncome ? 'text-[#0078d4]' : 'text-slate-400'} /> Income Entry
                        </button>
                        <button
                            onClick={() => handleTypeChange('expense')}
                            className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-widest rounded-[3px] transition-all flex items-center justify-center gap-2 ${!isIncome ? 'bg-white text-[#ff3b30] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ArrowRightLeft size={14} className={!isIncome ? 'text-[#ff3b30]' : 'text-slate-400'} /> Expense Entry
                        </button>
                    </div>

                    <div className={`bg-white p-4 border rounded-[3px] space-y-4 transition-colors ${isIncome ? 'border-[#0285fd]/30' : 'border-[#ff3b30]/30'}`}>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{isIncome ? 'Income Account' : 'Expense Account'} *</label>
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => {
                                        const acc = lookups.find(a => a.code === e.target.value);
                                        setFormData(prev => ({ ...prev, AccCode: e.target.value, AccountName: acc ? acc.name : '' }));
                                        if (errors.AccCode) setErrors(prev => ({ ...prev, AccCode: null }));
                                    }}
                                    className={`w-full h-10 border ${errors.AccCode ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`}
                                >
                                    <option value="">Select account...</option>
                                    {lookups.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                                {errors.AccCode && <div className="text-[11px] text-red-500 mt-1">{errors.AccCode}</div>}
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{isIncome ? 'Buyer Name' : 'Vendor Name'} *</label>
                                <input type="text" name="PartyName" value={formData.PartyName} onChange={handleInputChange} className={`w-full h-10 border ${errors.PartyName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 text-gray-700 ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`} />
                                {errors.PartyName && <div className="text-[11px] text-red-500 mt-1">{errors.PartyName}</div>}
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Start Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.StartDate} onClick={() => setCalendarTarget('start')} className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 pr-10 text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`} />
                                    <button onClick={() => setCalendarTarget('start')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">End Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.EndDate} onClick={() => setCalendarTarget('end')} className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 pr-10 text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`} />
                                    <button onClick={() => setCalendarTarget('end')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-12 mt-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                <input type="text" name="Description" value={formData.Description} onChange={handleInputChange} placeholder="Enter transaction details..." className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 text-gray-700 ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`} />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Type *</label>
                                <select
                                    value={formData.PayType}
                                    onChange={(e) => { setFormData(prev => ({ ...prev, PayType: e.target.value })); if (errors.PayType) setErrors(prev => ({ ...prev, PayType: null })); }}
                                    className={`w-full h-10 border ${errors.PayType ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd]' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]'}`}
                                >
                                    <option value="">Select type...</option>
                                    {payTypes.map((pay, idx) => (
                                        <option key={idx} value={pay.name}>{pay.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{isIncome ? 'Credit Amount' : 'Debit Amount'} *</label>
                                <input type="number" name="Amount" value={formData.Amount} onChange={handleInputChange} placeholder="0.00" className={`w-full h-10 border ${errors.Amount ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-[3px] px-3 text-[14px] bg-white outline-none focus:ring-1 text-right ${isIncome ? 'focus:border-[#0285fd] focus:ring-[#0285fd] text-gray-700' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30] text-red-500'}`} />
                                {errors.Amount && <div className="text-[11px] text-red-500 mt-1">{errors.Amount}</div>}
                            </div>
                            {errors.PayType && <div className="col-span-6 -mt-3 text-[11px] text-red-500">{errors.PayType}</div>}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center transition-colors">
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${isIncome ? 'text-gray-500' : 'text-[#ff3b30]'}`}>Recent {isIncome ? 'Fixed Income' : 'Fixed Expense'} Entries</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${isIncome ? 'text-[#0285fd] bg-blue-50 border-green-100' : 'text-[#ff3b30] bg-red-50 border-red-100'}`}>{transactionList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                    <tr><th className="px-4 py-2">{isIncome ? 'Income Source' : 'Expense Source'}</th><th className="px-4 py-2">{isIncome ? 'Buyer' : 'Vendor'}</th><th className="px-4 py-2 text-center">Start Date</th><th className="px-4 py-2 text-center">End Date</th><th className="px-4 py-2 text-right">Amount</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactionList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-all group">
                                            <td className="px-4 py-2">
                                                <div className={`text-[10px] font-bold font-mono mb-0.5 ${isIncome ? 'text-blue-700' : 'text-[#ff3b30]'}`}>{item.accCode}</div>
                                                <div className={`text-[11px] font-bold text-gray-700 uppercase leading-tight ${isIncome ? 'group-hover:text-blue-600' : 'group-hover:text-[#ff3b30]'}`}>{isIncome ? item.incomeAccount : item.expenseAccount}</div>
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-600 uppercase">{isIncome ? item.buyer : item.vendor}</td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-500 text-center">{item.startDate || (isIncome ? item.creditDate : item.debitDate)}</td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-500 text-center">{item.endDate || '-'}</td>
                                            <td className={`px-4 py-2 text-[12px] font-black text-right ${isIncome ? 'text-gray-700' : 'text-red-500'}`}>{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {transactionList.length === 0 && (
                                        <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest italic">No fixed {isIncome ? 'income' : 'expense'} records found for this company.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal 
                isOpen={!!calendarTarget} 
                onClose={() => setCalendarTarget(null)} 
                onDateSelect={(date) => {
                    if (calendarTarget === 'start') {
                        setFormData(prev => ({ ...prev, StartDate: date }));
                    } else if (calendarTarget === 'end') {
                        setFormData(prev => ({ ...prev, EndDate: date }));
                    }
                    setCalendarTarget(null);
                }} 
                initialDate={calendarTarget === 'start' ? formData.StartDate : formData.EndDate} 
            />
        </>
    );
};

export default FixedTransactionEntryBoard;
