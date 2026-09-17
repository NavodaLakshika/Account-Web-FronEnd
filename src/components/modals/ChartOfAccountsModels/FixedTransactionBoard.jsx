import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { RotateCcw, Save, Loader2, Calendar, PlusCircle, ArrowRightLeft } from 'lucide-react';
import { fixedIncomeService } from '../../../services/fixedIncome.service';
import { fixedExpensesService } from '../../../services/fixedExpenses.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import CalendarModal from '../../CalendarModal';
import { getCompanyCode } from '../../../utils/session';

const FixedTransactionBoard = ({ isOpen, onClose }) => {
    const [transactionType, setTransactionType] = useState('income'); // 'income' or 'expense'

    const initialState = {
        AccCode: '',
        AccountName: '',
        PartyName: '',
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date().toISOString().split('T')[0],
        PayType: '',
        Amount: '',
        Description: '',
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [payTypes, setPayTypes] = useState([]);
    const [transactionList, setTransactionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState(null); // 'start' or 'end'

    useEffect(() => {
        if (isOpen) {
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
        setFormData({ ...initialState, StartDate: formData.StartDate, EndDate: formData.EndDate }); // Preserve dates when switching
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    const handleSave = async () => {
        if (!formData.AccCode) return showErrorToast('Please select an account type.');
        if (!formData.PartyName) return showErrorToast(`${transactionType === 'income' ? 'Buyer' : 'Vendor'} name is required.`);
        if (!formData.Amount || isNaN(formData.Amount)) return showErrorToast('Please enter a valid amount.');
        if (!formData.PayType) return showErrorToast('Please select a payment type.');

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
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    const isIncome = transactionType === 'income';
    const themeColor = isIncome ? '#0078d4' : '#ff3b30';

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Fixed Income & Expenses Entry"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md ${isIncome ? 'bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            SAVE
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
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

                    {/* Main Form */}
                    <div className={`bg-white p-6 rounded-[3px] space-y-5 shadow-sm border-l-4 transition-colors ${isIncome ? 'border-l-[#0078d4]' : 'border-l-[#ff3b30]'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {/* Account Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {isIncome ? 'Income Account' : 'Expense Account'}
                                </label>
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => {
                                        const acc = lookups.find(a => a.code === e.target.value);
                                        setFormData(prev => ({ ...prev, AccCode: e.target.value, AccountName: acc ? acc.name : '' }));
                                    }}
                                    className={`w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:ring-2 bg-white rounded text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#00D1FF] focus:ring-[#00D1FF]/20' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]/20'}`}
                                >
                                    <option value="">Select account...</option>
                                    {lookups.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Party Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {isIncome ? 'Buyer Name' : 'Vendor Name'}
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="PartyName"
                                        value={formData.PartyName}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder=""
                                        className={`flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:ring-2 text-gray-700 bg-white ${isIncome ? 'focus:border-[#00D1FF] focus:ring-[#00D1FF]/20' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]/20'}`}
                                    />
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Start Date
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="StartDate"
                                        value={formData.StartDate}
                                        readOnly
                                        onClick={() => setCalendarTarget('start')}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setCalendarTarget('start')}
                                        className={`w-9 h-8 text-white flex items-center justify-center rounded transition-all shadow-sm active:scale-95 shrink-0 border-none ${isIncome ? 'bg-[#0285fd] hover:bg-[#0073ff]' : 'bg-[#ff3b30] hover:bg-[#e0352b]'}`}
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    End Date
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="EndDate"
                                        value={formData.EndDate}
                                        readOnly
                                        onClick={() => setCalendarTarget('end')}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setCalendarTarget('end')}
                                        className={`w-9 h-8 text-white flex items-center justify-center rounded transition-all shadow-sm active:scale-95 shrink-0 border-none ${isIncome ? 'bg-[#0285fd] hover:bg-[#0073ff]' : 'bg-[#ff3b30] hover:bg-[#e0352b]'}`}
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Pay Type */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Payment Type
                                </label>
                                <select
                                    value={formData.PayType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, PayType: e.target.value }))}
                                    className={`w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:ring-2 bg-white rounded text-gray-700 cursor-pointer ${isIncome ? 'focus:border-[#00D1FF] focus:ring-[#00D1FF]/20' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]/20'}`}
                                >
                                    <option value="">Select type...</option>
                                    {payTypes.map((pay, idx) => (
                                        <option key={idx} value={pay.name}>{pay.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {isIncome ? 'Credit Amount' : 'Debit Amount'}
                                </label>
                                <div className="relative">
                                    <input 
                                        name="Amount"
                                        value={formData.Amount}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0.00"
                                        className={`w-full h-10 border border-slate-200 px-4 text-[16px] focus:ring-2 outline-none rounded font-black text-right shadow-sm pr-12 bg-white transition-colors ${isIncome ? 'focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 text-slate-700' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]/20 text-red-500'}`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    Description
                                </label>
                                <input 
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder="Enter details about this transaction..."
                                    className={`w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:ring-2 bg-white rounded text-gray-700 ${isIncome ? 'focus:border-[#00D1FF] focus:ring-[#00D1FF]/20' : 'focus:border-[#ff3b30] focus:ring-[#ff3b30]/20'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center transition-colors">
                            <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${isIncome ? 'text-[#0285fd]' : 'text-[#ff3b30]'}`}>
                                <PlusCircle size={14} /> Recent {isIncome ? 'Income' : 'Expense'} Entries
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-[3px] shadow-sm ${isIncome ? 'text-[#0285fd] bg-blue-50 border-blue-100' : 'text-[#ff3b30] bg-red-50 border-red-100'}`}>
                                {transactionList.length} Entries Found
                            </span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">
                                            {isIncome ? 'Income Source' : 'Expense Source'}
                                        </th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">
                                            {isIncome ? 'Buyer' : 'Vendor'}
                                        </th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-5 py-3">Start Date</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-5 py-3">End Date</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right px-5 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <td className="text-[12px] font-bold text-slate-700 uppercase px-5 py-3">
                                                <div className={`text-[10px] font-bold font-mono mb-0.5 ${isIncome ? 'text-[#0285fd]' : 'text-[#ff3b30]'}`}>
                                                    {item.accCode}
                                                </div>
                                                <div className={`text-[11px] font-bold text-gray-700 uppercase leading-tight group-hover:text-opacity-80 transition-colors ${isIncome ? 'group-hover:text-[#0285fd]' : 'group-hover:text-[#ff3b30]'}`}>
                                                    {isIncome ? item.incomeAccount : item.expenseAccount}
                                                </div>
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase px-5 py-3">
                                                {isIncome ? item.buyer : item.vendor}
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase px-5 py-3 text-center">
                                                {item.startDate || (isIncome ? item.creditDate : item.debitDate)}
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase px-5 py-3 text-center">
                                                {item.endDate || '-'}
                                            </td>
                                            <td className={`text-[12px] font-black text-right px-5 py-3 ${isIncome ? 'text-slate-700' : 'text-red-500'}`}>
                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactionList.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                No {isIncome ? 'income' : 'expense'} records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

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

export default FixedTransactionBoard;
