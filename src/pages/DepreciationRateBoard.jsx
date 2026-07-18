import React, { useState, useEffect } from 'react';
import { RotateCcw, Save } from 'lucide-react';
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

    const handleAccountSelect = (code) => {
        const item = lookups.find(l => l.code === code);
        if (!item) { setFormData(prev => ({ ...prev, AccCode: '', AccountName: '' })); setIsEditMode(false); return; }
        const existing = rateList.find(r => r.accCode === code);
        setFormData(prev => ({ ...prev, AccCode: item.code, AccountName: item.name, DepRate: existing ? existing.depRate : '' }));
        setIsEditMode(!!existing);
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
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => handleAccountSelect(e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select account...</option>
                                    {lookups.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
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
                                    <tr><th className="px-4 py-2">Account Code</th><th className="px-4 py-2">Asset Description</th><th className="px-4 py-2 text-right">Rate (%)</th></tr>
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
        </>
    );
};

export default DepreciationRateBoard;
