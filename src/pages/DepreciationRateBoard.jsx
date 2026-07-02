import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save } from 'lucide-react';
import { depRateService } from '../services/depRate.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const DepreciationRateBoard = ({ isOpen, onClose }) => {
    const initialState = { AccCode: '', AccountName: '', DepRate: '', CreateUser: 'SYSTEM' };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accSearchQuery, setAccSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            setFormData(prev => ({ ...prev, CreateUser: user?.emp_Name || user?.empName || 'SYSTEM' }));
            fetchLookups();
            fetchList();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try { const data = await depRateService.getLookups(); setLookups(data || []); } catch (error) { console.error('Lookup error:', error); }
    };

    const fetchList = async () => {
        try { const data = await depRateService.getList(); setRateList(data || []); } catch (error) { showErrorToast('Failed to load registered depreciation rates.'); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({ ...initialState, CreateUser: formData.CreateUser });
        setIsEditMode(false);
    };

    const handleAccountSelect = (item) => {
        setFormData(prev => ({ ...prev, AccCode: item.code, AccountName: item.name }));
        setShowAccountSearch(false);
        const existing = rateList.find(r => r.accCode === item.code);
        if (existing) {
            setFormData(prev => ({ ...prev, DepRate: existing.depRate }));
            setIsEditMode(true);
        } else {
            setFormData(prev => ({ ...prev, DepRate: '' }));
            setIsEditMode(false);
        }
    };

    const handleSave = async () => {
        if (!formData.AccCode) { showErrorToast('Please select an account.'); return; }
        if (formData.DepRate === '' || isNaN(formData.DepRate)) { showErrorToast('Please enter a valid depreciation rate.'); return; }
        setLoading(true);
        try {
            if (isEditMode) {
                await depRateService.edit({ ...formData, DepRate: parseFloat(formData.DepRate) });
                showSuccessToast('Record updated successfully.');
            } else {
                await depRateService.save({ ...formData, DepRate: parseFloat(formData.DepRate) });
                showSuccessToast('Record saved successfully.');
            }
            handleClear();
            fetchList();
        } catch (error) { showErrorToast(error.message || 'Failed to save record.'); } finally { setLoading(false); }
    };

    const handleRowClick = (rate) => {
        setFormData({ AccCode: rate.accCode, AccountName: rate.accountName, DepRate: rate.depRate, CreateUser: formData.CreateUser });
        setIsEditMode(true);
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Define asset depreciation rates" icon={null}
                isOpen={isOpen} onClose={onClose} title="Depreciation Rate"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> {isEditMode ? 'UPDATE' : 'SAVE'}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px]">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center">Depreciation is a decline in value, especially the reduction in the value of a fixed asset charge as an expense when calculation profit and loss.</p>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-7">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Asset Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.AccountName} onClick={() => setShowAccountSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowAccountSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                    {formData.AccCode && (
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-green-100 px-1.5 py-0.5 rounded">{formData.AccCode}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Depreciation Rate (%)</label>
                                <div className="relative">
                                    <input type="number" name="DepRate" value={formData.DepRate} onChange={handleInputChange} step="0.1" placeholder="0.0" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center pr-8" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Registered Depreciation Rates</span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-green-100 rounded">{rateList.length} Records</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                    <tr><th className="px-4 py-2">Account Code</th><th className="px-4 py-2">Asset Description</th><th className="px-4 py-2 text-right">Rate (%)</th><th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rateList.map((rate, idx) => (
                                        <tr key={idx} onClick={() => handleRowClick(rate)} className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-all group">
                                            <td className="px-4 py-2.5 font-mono text-[12px] font-bold text-blue-700">{rate.accCode}</td>
                                            <td className="px-4 py-2.5 text-[12px] font-bold text-gray-700 uppercase group-hover:text-blue-600">{rate.accountName}</td>
                                            <td className="px-4 py-2.5 text-[12px] font-black text-orange-500 text-right">{rate.depRate?.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    {rateList.length === 0 && (
                                        <tr><td colSpan="3" className="px-4 py-10 text-center text-gray-400 font-bold text-[11px] italic uppercase tracking-widest">No depreciation rates defined yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showAccountSearch} onClose={() => setShowAccountSearch(false)} title="Asset Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find by Account Name or Code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Account Code</th><th className=" px-5 py-3">Account Description</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookups.filter(a => (a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase())).map((acc, idx) => (
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
        </>
    );
};

export default DepreciationRateBoard;
