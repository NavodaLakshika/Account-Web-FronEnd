import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Loader2, X, Calendar, DollarSign, User, PlusCircle } from 'lucide-react';
import { fixedIncomeService } from '../../../services/fixedIncome.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import CalendarModal from '../../CalendarModal';

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
            IncomeAccount: acc.name
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
                maxWidth="max-w-[850px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            SAVE
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Main Form */}
 <div className="bg-white p-6 rounded-[5px] space-y-5 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {/* Account Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Income Account</label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.IncomeAccount} 
                                            readOnly 
                                            className="w-full h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-blue-600 shadow-sm cursor-not-allowed"
                                        />
                                        {formData.AccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shadow-sm">
                                                {formData.AccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAccSearch(true)} 
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Buyer Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    Buyer Name
                                </label>
                                <input 
                                    name="Buyer"
                                    value={formData.Buyer}
                                    onChange={handleInputChange}
                                    type="text"
                                    placeholder=""
                                    className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white"
                                />
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
 <div className=" rounded-[5px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0285fd] uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={14} /> Recent Fixed Income Entries
                            </span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-[5px] shadow-sm">{incomeList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Income Source</th>
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Buyer</th>
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Date</th>
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomeList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-2">
                                                <div className="text-[10px] font-bold text-[#0285fd] font-mono mb-0.5">{item.accCode}</div>
                                                <div className="text-[11px] font-bold text-gray-700 uppercase leading-tight group-hover:text-blue-600 transition-colors">{item.incomeAccount}</div>
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-600 uppercase">{item.buyer}</td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-500 text-center">{item.creditDate}</td>
                                            <td className="px-4 py-2 text-[12px] font-black text-slate-700 text-right">
                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {incomeList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-12 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest italic">
                                                No fixed income records found for this company.
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
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAccSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Income Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="FIND BY NAME OR CODE..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-md w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all uppercase" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200 z-10">
                                    <tr>
                                        <th className="px-5 py-3 w-32">Account Code</th>
                                        <th className="px-5 py-3">Account Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar block" style={{ maxHeight: '400px' }}>
                                    {lookups.filter(a => 
                                        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        (a.code || '').toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((acc, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => handleAccountSelect(acc)}
                                            className="group hover:bg-slate-50 cursor-pointer transition-colors flex w-full table-fixed"
                                        >
                                            <td className="px-5 py-3 w-32 font-mono text-[12px] font-bold text-slate-500">{acc.code}</td>
                                            <td className="px-5 py-3 flex-1 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{acc.name}</td>
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
            )}

            {/* Payment Type Search Modal */}
            {showPayTypeSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowPayTypeSearch(false)} />
 <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
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
                            {(payTypes.length > 0 ? payTypes : [
                                { code: 'CASH', name: 'CASH' },
                                { code: 'CHQ', name: 'CHEQUE' },
                                { code: 'CC', name: 'CREDIT CARD' },
                                { code: 'BT', name: 'BANK TRANSFER' }
                            ]).map((pay, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handlePayTypeSelect(pay)}
                                    className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all text-left flex justify-between items-center group shadow-sm"
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
                    setFormData(prev => ({ ...prev, CreditDate: date }));
                    setShowCalendar(false);
                }} 
                initialDate={formData.CreditDate} 
            />
        </>
    );
};

export default FixedIncomeBoard;
