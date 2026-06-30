import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Loader2, X, Calendar, DollarSign, User, PlusCircle } from 'lucide-react';
import { fixedExpensesService } from '../../../services/fixedExpenses.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import CalendarModal from '../../CalendarModal';
import { getCompanyCode } from '../../../utils/session';

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
            const company = getCompanyCode() || '';
            
            setFormData(prev => ({ 
                ...prev, 
                Company: company,
                CreateUser: user?.emp_Name || user?.empName || ''
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
        const company = getCompanyCode() || '';
        setFormData({
            ...initialState,
            Company: company,
            CreateUser: user?.emp_Name || user?.empName || ''
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
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            SAVE
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Main Form */}
 <div className="bg-white p-6 rounded-[3px] space-y-5 shadow-sm border-l-4 border-l-[#ff3b30]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {/* Account Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Expense Account</label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.ExpenseAccount} 
                                            readOnly 
                                            className="w-full h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-red-500 shadow-sm cursor-not-allowed"
                                        />
                                        {formData.AccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#ff3b30] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded shadow-sm">
                                                {formData.AccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAccSearch(true)} 
                                        className="w-9 h-8 bg-white text-[#ff3b30] border-2 border-[#ff3b30] hover:bg-red-50 flex items-center justify-center hover:bg-[#e03127] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Vendor Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    Vendor Name
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="Vendor"
                                        value={formData.Vendor}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder=""
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white"
                                    />
                                    <div className="w-9 h-8 shrink-0"></div>
                                </div>
                            </div>

                            {/* Debit Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Debit Date
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="DebitDate"
                                        value={formData.DebitDate}
                                        readOnly
                                        onClick={() => setShowCalendar(true)}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowCalendar(true)}
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
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
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={formData.PayType} 
                                        readOnly 
                                        placeholder=""
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                    />
                                    <button 
                                        onClick={() => setShowPayTypeSearch(true)} 
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Debit Amount</label>
                                <div className="relative">
                                    <input 
                                        name="Amount"
                                        value={formData.Amount}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full h-10 border border-slate-200 px-4 text-[16px] focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded font-black text-right text-red-500 shadow-sm pr-12 bg-white"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
 <div className=" rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#ff3b30] uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={14} /> Recent Fixed Expense Entries
                            </span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-[3px] shadow-sm">{expenseList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Expense Source</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Vendor</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-5 py-3">Date</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right px-5 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <div className="text-[10px] font-bold text-[#ff3b30] font-mono mb-0.5">{item.accCode}</div>
                                                <div className="text-[11px] font-bold text-gray-700 uppercase leading-tight group-hover:text-[#ff3b30] transition-colors">{item.expenseAccount}</div>
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.vendor}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.debitDate}</td>
                                            <td className="text-[12px] font-black text-red-500 text-right px-5 py-3">
                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {expenseList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                No fixed expense records found for this company.
                                            </td>
                                        <th className="text-right px-5 py-3">Action</th></tr>
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
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAccSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: '#ff3b30' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#ff3b30]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Expense Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="FIND BY NAME OR CODE..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/20 outline-none shadow-sm transition-all uppercase" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200 z-10">
                                        <tr>
                                            <th className="px-5 py-3 w-32">Account Code</th>
                                            <th className="px-5 py-3">Account Name</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {lookups.filter(a => 
                                            (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            (a.code || '').toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((acc, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => handleAccountSelect(acc)}
                                                className="group hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 w-32 font-mono text-[12px] font-bold text-slate-500">{acc.code}</td>
                                                <td className="px-5 py-3 flex-1 text-[12px] font-bold text-slate-700 uppercase group-hover:text-[#ff3b30] transition-colors">{acc.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase tracking-widest border-none">Select</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Type Search Modal */}
            {showPayTypeSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowPayTypeSearch(false)} />
 <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Payment Type Lookup</span>
                            </div>
                            <button onClick={() => setShowPayTypeSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {payTypes.map((pay, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handlePayTypeSelect(pay)}
                                    className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-slate-50 border border-slate-200 rounded-[3px] transition-all text-left flex justify-between items-center group shadow-sm"
                                >
                                    <span className="uppercase tracking-widest">{pay.name}</span>
                                    <PlusCircle size={16} className="text-gray-300 group-hover:text-[#0285fd] transition-colors" />
                                </button>
                            ))}
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
