import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Loader2, X, Calendar, DollarSign, User, PlusCircle } from 'lucide-react';
import { fixedExpensesService } from '../../../services/fixedExpenses.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import CalendarModal from '../../CalendarModal';

const FixedExpensesBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AccCode: '',
        ExpenseAccount: '',
        Vendor: '',
        DebitDate: new Date().toISOString().split('T')[0],
        PayType: '',
        Amount: '',
        Company: '',
        CreateUser: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [payTypes, setPayTypes] = useState([]);
    const [expenseList, setExpenseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAccSearch, setShowAccSearch] = useState(false);
    const [showPayTypeSearch, setShowPayTypeSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paySearchTerm, setPaySearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const company = localStorage.getItem('companyCode') || 'C001';
            
            setFormData(prev => ({ 
                ...prev, 
                Company: company,
                CreateUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));

            fetchLookups();
            fetchList(company);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await fixedExpensesService.getLookups();
            setLookups(data.accounts || []);
            setPayTypes(data.payTypes || []);
        } catch (error) {
            console.error('Lookup error:', error);
        }
    };

    const fetchList = async (company) => {
        try {
            const data = await fixedExpensesService.getList(company);
            setExpenseList(data || []);
        } catch (error) {
            console.error('List error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const company = localStorage.getItem('companyCode') || 'C001';
        setFormData({
            ...initialState,
            Company: company,
            CreateUser: user?.emp_Name || user?.empName || 'SYSTEM'
        });
    };

    const handleAccountSelect = (acc) => {
        setFormData(prev => ({
            ...prev,
            AccCode: acc.code,
            ExpenseAccount: acc.name
        }));
        setShowAccSearch(false);
    };

    const handlePayTypeSelect = (pay) => {
        setFormData(prev => ({
            ...prev,
            PayType: pay.name
        }));
        setShowPayTypeSearch(false);
    };

    const handleSave = async () => {
        if (!formData.AccCode) {
            showErrorToast('Please select an account type.');
            return;
        }
        if (!formData.Vendor) {
            showErrorToast('Vendor name is required.');
            return;
        }
        if (!formData.Amount || isNaN(formData.Amount)) {
            showErrorToast('Please enter a valid debit amount.');
            return;
        }
        if (!formData.PayType) {
            showErrorToast('Please select a pay type.');
            return;
        }

        setLoading(true);
        try {
            await fixedExpensesService.save(formData);
            showSuccessToast('Fixed Expense added successfully');
            handleClear();
            fetchList(formData.Company);
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Fixed Expenses Entry"
                maxWidth="max-w-[850px]"
                footer={
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            Save Record
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Main Form */}
                    <div className="bg-white p-6 border border-gray-200 rounded-[5px] space-y-5 shadow-sm border-l-4 border-l-[#ff3b30]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {/* Account Selection */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Expense Account</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.ExpenseAccount} 
                                            readOnly 
                                            className="w-full h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-red-600 shadow-sm"
                                        />
                                        {formData.AccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {formData.AccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAccSearch(true)} 
                                        className="w-10 h-9 bg-[#ff3b30] text-white flex items-center justify-center hover:bg-[#e03127] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Vendor Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <User size={12} className="text-gray-400" /> Vendor Name
                                </label>
                                <input 
                                    name="Vendor"
                                    value={formData.Vendor}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder=""
                                    className="w-full h-9 border border-gray-300 px-3 text-[12.5px] focus:border-blue-500 outline-none rounded-[5px] font-medium shadow-sm uppercase"
                                />
                            </div>

                            {/* Debit Date */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    Debit Date
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        name="DebitDate"
                                        value={formData.DebitDate}
                                        readOnly
                                        onClick={() => setShowCalendar(true)}
                                        className="flex-1 h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-gray-600 shadow-sm cursor-pointer"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowCalendar(true)}
                                        className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md shrink-0 hover:bg-[#0073ff] active:scale-95 transition-all"
                                    >
                                        <Calendar size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Pay Type */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign size={12} className="text-gray-400" /> Payment Type
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={formData.PayType} 
                                        readOnly 
                                        placeholder=""
                                        className="w-full h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-gray-600 shadow-sm"
                                    />
                                    <button 
                                        onClick={() => setShowPayTypeSearch(true)} 
                                        className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Debit Amount</label>
                                <div className="relative">
                                    <input 
                                        name="Amount"
                                        value={formData.Amount}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full h-12 border border-gray-300 px-4 text-[20px] focus:border-blue-500 outline-none rounded-[5px] font-black text-right text-red-600 shadow-sm pr-12 bg-[#fef2f2]"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 uppercase tracking-tighter">Rs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="border border-gray-200 rounded-[5px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0078d4] uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={14} /> Recent Fixed Expense Entries
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 border rounded-full">{expenseList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="bg-slate-100 border-b border-gray-200 shadow-sm">
                                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase">Expense Source</th>
                                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase">Vendor</th>
                                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase text-center">Date</th>
                                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-600 uppercase text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-red-50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="text-[11px] font-bold text-[#ff3b30] font-mono mb-0.5">{item.accCode}</div>
                                                <div className="text-[12px] font-medium text-gray-700 uppercase leading-tight">{item.expenseAccount}</div>
                                            </td>
                                            <td className="px-4 py-3 text-[12px] font-medium text-gray-600 uppercase">{item.vendor}</td>
                                            <td className="px-4 py-3 text-[11px] font-bold text-gray-500 text-center">{item.debitDate}</td>
                                            <td className="px-4 py-3 text-[13px] font-black text-red-600 text-right">
                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {expenseList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-12 text-center text-gray-400 text-[12px]">
                                                No fixed expense records found for this company.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account Search Modal */}
            {showAccSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: '#ff3b30' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#ff3b30]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Expense Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100">
                            <input 
                                type="text" 
                                placeholder="SEARCH BY NAME OR CODE..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-full focus:border-[#ff3b30] outline-none shadow-sm uppercase" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-2">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {lookups.filter(a => 
                                    (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (a.code || '').toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((acc, idx) => (
                                    <button key={idx} onClick={() => handleAccountSelect(acc)} className="w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-100 hover:bg-red-50 transition-all text-left group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-[#ff3b30] font-mono tracking-tighter">{acc.code}</span>
                                            <span className="text-[12px] font-bold text-gray-700 uppercase leading-tight">{acc.name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold uppercase group-hover:scale-105 transition-transform">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Type Search Modal */}
            {showPayTypeSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPayTypeSearch(false)} />
                    <div className="relative w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Payment Type Lookup</span>
                            </div>
                            <button onClick={() => setShowPayTypeSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100">
                            <input 
                                type="text" 
                                placeholder="FILTER PAYMENT TYPES..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-full focus:border-[#0285fd] outline-none shadow-sm uppercase" 
                                value={paySearchTerm} 
                                onChange={(e) => setPaySearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-2">
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {(payTypes.length > 0 ? payTypes : [
                                    { code: 'CASH', name: 'CASH' },
                                    { code: 'CHQ', name: 'CHEQUE' },
                                    { code: 'CC', name: 'CREDIT CARD' },
                                    { code: 'BT', name: 'BANK TRANSFER' }
                                ]).filter(p => 
                                    (p.name || '').toLowerCase().includes(paySearchTerm.toLowerCase())
                                ).map((pay, idx) => (
                                    <button key={idx} onClick={() => handlePayTypeSelect(pay)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-all text-left group">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase leading-tight">{pay.name}</span>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold uppercase group-hover:scale-105 transition-transform">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={(date) => {
                    setFormData(prev => ({ ...prev, DebitDate: date }));
                    setShowCalendar(false);
                }} 
                initialDate={formData.DebitDate} 
            />
        </>
    );
};

export default FixedExpensesBoard;
