import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Save, Calendar } from 'lucide-react';
import { fixedIncomeService } from '../services/fixedIncome.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { getCompanyCode } from '../utils/session';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SearchableSelect from '../components/SearchableSelect';

const FixedIncomeEntryBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AccCode: '', IncomeAccount: '', Buyer: '', CreditDate: new Date().toISOString().split('T')[0],
        PayType: '', Amount: '', Company: '', CreateUser: ''
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

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const company = getCompanyCode() || '';
            setFormData(prev => ({ ...prev, Company: company, CreateUser: user?.emp_Name || user?.empName || '' }));
            fetchLookups();
            fetchList(company);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try { const data = await fixedIncomeService.getLookups(); setLookups(data.accounts || []); setPayTypes(data.payTypes || []); } catch (error) { console.error('Lookup error:', error); }
    };

    const fetchList = async (company) => {
        try { const data = await fixedIncomeService.getList(company); setIncomeList(data || []); } catch (error) { showErrorToast('Failed to load recent fixed income entries.'); }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleClear = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const company = getCompanyCode() || '';
        setFormData({ ...initialState, Company: company, CreateUser: user?.emp_Name || user?.empName || '' });
    };

    const handleAccountSelect = (acc) => { setFormData(prev => ({ ...prev, AccCode: acc.code, IncomeAccount: acc.name })); setShowAccSearch(false); };
    const handlePayTypeSelect = (pay) => { setFormData(prev => ({ ...prev, PayType: pay.name })); setShowPayTypeSearch(false); };

    const handleSave = async () => {
        if (!formData.AccCode) { showErrorToast('Please select an account type.'); return; }
        if (!formData.Buyer) { showErrorToast('Buyer name is required.'); return; }
        if (!formData.Amount || isNaN(formData.Amount)) { showErrorToast('Please enter a valid credit amount.'); return; }
        if (!formData.PayType) { showErrorToast('Please select a pay type.'); return; }
        setLoading(true);
        try {
            await fixedIncomeService.save(formData);
            showSuccessToast('Fixed Income added successfully');
            handleClear();
            fetchList(formData.Company);
        } catch (error) { showErrorToast(error.message || 'Failed to save record'); } finally { setLoading(false); }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Record fixed income transactions" icon={null}
                isOpen={isOpen} onClose={onClose} title="Fixed Income Entry"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Income Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.IncomeAccount} onClick={() => setShowAccSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowAccSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                    {formData.AccCode && (
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-green-100 px-1.5 py-0.5 rounded">{formData.AccCode}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Buyer Name</label>
                                <input type="text" name="Buyer" value={formData.Buyer} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.CreditDate} onClick={() => setShowCalendar(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Type</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.PayType} onClick={() => setShowPayTypeSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowPayTypeSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Amount</label>
                                <input type="number" name="Amount" value={formData.Amount} onChange={handleInputChange} placeholder="0.00" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Recent Fixed Income Entries</span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-green-100 rounded">{incomeList.length} Entries Found</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                    <tr><th className="px-4 py-2">Income Source</th><th className="px-4 py-2">Buyer</th><th className="px-4 py-2 text-center">Date</th><th className="px-4 py-2 text-right">Amount</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {incomeList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/50 transition-all group">
                                            <td className="px-4 py-2">
                                                <div className="text-[10px] font-bold text-blue-700 font-mono mb-0.5">{item.accCode}</div>
                                                <div className="text-[11px] font-bold text-gray-700 uppercase leading-tight group-hover:text-blue-600">{item.incomeAccount}</div>
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-600 uppercase">{item.buyer}</td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-500 text-center">{item.creditDate}</td>
                                            <td className="px-4 py-2 text-[12px] font-black text-gray-700 text-right">{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {incomeList.length === 0 && (
                                        <tr><td colSpan="4" className="px-4 py-12 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest italic">No fixed income records found for this company.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showAccSearch} onClose={() => setShowAccSearch(false)} title="Income Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="FIND BY NAME OR CODE..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Account Code</th><th className=" px-5 py-3">Account Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase())).map((acc, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleAccountSelect(acc)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{acc.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{acc.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showPayTypeSearch} onClose={() => setShowPayTypeSearch(false)} title="Payment Type Lookup" maxWidth="max-w-[700px]">
                <div className="p-4 space-y-2 font-['Tahoma']">
                    {payTypes.map((pay, idx) => (
                        <button key={idx} onClick={() => handlePayTypeSelect(pay)} className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-slate-50 border border-slate-200 rounded-[3px] transition-all text-left flex justify-between items-center group shadow-sm">
                            <span className="uppercase tracking-widest">{pay.name}</span>
                            <span className="text-[#e49e1b] group-hover:text-[#0285fd] transition-colors font-black text-xs">SELECT</span>
                        </button>
                    ))}
                    {payTypes.length === 0 && <p className="text-center text-gray-400 text-xs py-4">No payment types found.</p>}
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onDateSelect={(date) => { setFormData(prev => ({ ...prev, CreditDate: date })); setShowCalendar(false); }} initialDate={formData.CreditDate} />
        </>
    );
};

export default FixedIncomeEntryBoard;
