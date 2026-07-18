import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { RotateCcw, Save, Loader2, Calendar, PlusCircle } from 'lucide-react';
import { fixedIncomeService } from '../../../services/fixedIncome.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import CalendarModal from '../../CalendarModal';
import { getCompanyCode } from '../../../utils/session';

const FixedIncomeBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AccCode: '',
        IncomeAccount: '',
        Buyer: '',
        CreditDate: new Date().toISOString().split('T')[0],
        PayType: '',
        Amount: '',
        Company: '',
        CreateUser: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [payTypes, setPayTypes] = useState([]);
    const [incomeList, setIncomeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

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
            const data = await fixedIncomeService.getLookups();
            setLookups(data.accounts || []);
            setPayTypes(data.payTypes || []);
        } catch (error) {
            console.error('Lookup error:', error);
        }
    };

    const fetchList = async (company) => {
        try {
            const data = await fixedIncomeService.getList(company);
            setIncomeList(data || []);
        } catch (error) {
            console.error('List error:', error);
            showErrorToast('Failed to load recent fixed income entries.');
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

    const handleSave = async () => {
        if (!formData.AccCode) {
            showErrorToast('Please select an account type.');
            return;
        }
        if (!formData.Buyer) {
            showErrorToast('Buyer name is required.');
            return;
        }
        if (!formData.Amount || isNaN(formData.Amount)) {
            showErrorToast('Please enter a valid credit amount.');
            return;
        }
        if (!formData.PayType) {
            showErrorToast('Please select a pay type.');
            return;
        }

        setLoading(true);
        try {
            await fixedIncomeService.save(formData);
            showSuccessToast('Fixed Income added successfully');
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
                title="Fixed Income Entry"
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
 <div className="bg-white p-6 rounded-[3px] space-y-5 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {/* Account Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Income Account</label>
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => {
                                        const acc = lookups.find(a => a.code === e.target.value);
                                        setFormData(prev => ({ ...prev, AccCode: e.target.value, IncomeAccount: acc ? acc.name : '' }));
                                    }}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select account...</option>
                                    {lookups.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Buyer Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    Buyer Name
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="Buyer"
                                        value={formData.Buyer}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder=""
                                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white"
                                    />
                                </div>
                            </div>

                            {/* Credit Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Credit Date
                                </label>
                                <div className="flex gap-1">
                                    <input 
                                        name="CreditDate"
                                        value={formData.CreditDate}
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
                                <select
                                    value={formData.PayType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, PayType: e.target.value }))}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select type...</option>
                                    {payTypes.map((pay, idx) => (
                                        <option key={idx} value={pay.name}>{pay.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Credit Amount</label>
                                <div className="relative">
                                    <input 
                                        name="Amount"
                                        value={formData.Amount}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full h-10 border border-slate-200 px-4 text-[16px] focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded font-black text-right text-slate-700 shadow-sm pr-12 bg-white"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
 <div className=" rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0285fd] uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={14} /> Recent Fixed Income Entries
                            </span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-[3px] shadow-sm">{incomeList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Income Source</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Buyer</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-5 py-3">Date</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right px-5 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomeList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <div className="text-[10px] font-bold text-[#0285fd] font-mono mb-0.5">{item.accCode}</div>
                                                <div className="text-[11px] font-bold text-gray-700 uppercase leading-tight group-hover:text-blue-600 transition-colors">{item.incomeAccount}</div>
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.buyer}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.creditDate}</td>
                                            <td className="text-[12px] font-black text-slate-700 text-right px-5 py-3">
                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {incomeList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                No fixed income records found for this company.
                                            </td>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={(date) => {
                    setFormData(prev => ({ ...prev, CreditDate: date }));
                    setShowCalendar(false);
                }} 
                initialDate={formData.CreditDate} 
            />
        </>
    );
};

export default FixedIncomeBoard;
